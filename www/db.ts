// helper functions for bun sqlite db

if (typeof Bun === "undefined") {
	throw new Error("requires bun")
}

import * as fs from "node:fs/promises"
import * as path from "node:path"
import * as sqlite from "bun:sqlite"

import {
	isDev,
} from "./utils"

export type ColumnType =
	| "INTEGER"
	| "TEXT"
	| "BOOLEAN"
	| "REAL"
	| "BLOB"

export type ColumnDef = {
	type: ColumnType,
	primaryKey?: boolean,
	autoIncrement?: boolean,
	allowNull?: boolean,
	unique?: boolean,
	default?: string | number,
	index?: boolean,
	fts?: boolean,
	reference?: {
		table: string,
		column: string,
	},
}

export type CreateDatabaseOpts = {
	wal?: boolean,
}

export type WhereOp =
	| "="
	| ">"
	| "<"
	| ">="
	| "<="
	| "!="
	| "BETWEEN"
	| "LIKE"
	| "IN"
	| "NOT BETWEEN"
	| "NOT LIKE"
	| "NOT IN"

export type WhereOpSingle =
	| "IS NULL"
	| "IS NOT NULL"

export type WhereValue =
	| string
	| { value: string, op: WhereOp }
	| { op: WhereOpSingle }

export type DBVal = string | number | boolean | Uint8Array | null
export type DBVars = Record<string, DBVal>
export type DBData = Record<string, DBVal>
export type WhereCondition = Record<string, WhereValue>
export type OrderCondition = {
	columns: string[],
	desc?: boolean,
}

export type SelectOpts = {
	columns?: "*" | ColumnName[],
	distinct?: boolean,
	where?: WhereCondition,
	order?: OrderCondition,
	limit?: number,
	offset?: number,
	join?: JoinTable<any>[],
}

export type ColumnName = string | {
	name: string,
	as: string,
}

export type JoinType =
	| "INNER"
	| "LEFT"
	| "RIGHT"
	| "FULL"

export type JoinTable<D> = {
	table: Table<D>,
	columns?: "*" | ColumnName[],
	on: {
		column: string,
		matchTable: Table<any>,
		matchColumn: string,
	},
	where?: WhereCondition,
	order?: OrderCondition,
	join?: JoinType,
}

export type TableSchema = Record<string, ColumnDef>

export type Table<D = DBData> = {
	name: string,
	select: <D2 = D>(opts?: SelectOpts) => D2[],
	insert: (data: D) => void,
	update: (data: Partial<D>, where: WhereCondition) => void,
	delete: (where: WhereCondition) => void,
	clear: () => void,
	find: <D2 = D>(where: WhereCondition) => D2,
	findAll: <D2 = D>(where: WhereCondition) => D2[],
	count: (where?: WhereCondition) => number,
	search: (text: string) => D[],
}

export type TableOpts<D> = {
	timeCreated?: boolean,
	timeUpdated?: boolean,
	paranoid?: boolean,
	initData?: D[],
}

type TableData<D extends DBData, O extends TableOpts<D>> =
	(O extends { timeCreated: true } ? D & { time_created?: string } : D)
	& (O extends { timeUpdated: true } ? D & { time_updated?: string } : D)
	& (O extends { paranoid: true } ? D & { time_deleted?: string } : D)

// https://discord.com/channels/508357248330760243/1203901900844572723
// typescript has no partial type inference...
export type Database = {
	createTable: <D extends DBData, O extends TableOpts<D> = TableOpts<D>>(
		name: string,
		schema: TableSchema,
		opts?: O,
	) => Table<TableData<D, O>>,
	getTable: <D extends DBData = any>(name: string) => Table<D> | void,
	dropTable: (name: string) => void,
	table: Database["createTable"],
	transaction: (action: () => void) => void,
	close: () => void,
    serialize: (name?: string) => Buffer,
}

export function dbPath(app: string, name: string) {
	if (isDev) {
		return `data/${name}`
	} else {
		return `${Bun.env["HOME"]}/.local/share/${app}/${name}`
	}
}

// TODO: db viewer
// TODO: support views
// TODO: builtin cache system
export async function createDatabase(loc: string, opts: CreateDatabaseOpts = {}): Promise<Database> {

	if (loc !== ":memory:") {
		await fs.mkdir(path.dirname(loc), { recursive: true })
	}

	const bdb = new sqlite.Database(loc)
	const queries: Record<string, sqlite.Statement> = {}

	if (opts.wal) {
		bdb.run("PRAGMA journal_mode = WAL;")
	}

	function genColumnNameSQL(columns: "*" | ColumnName[] = "*") {
		if (!columns || columns === "*") return "*"
		return columns.map((c) => {
			if (typeof c === "string") return c
			if (c.as) return `${c.name} AS ${c.as}`
		}).join(",")
	}

	// TODO: support OR
	function genWhereSQL(where: WhereCondition, vars: DBVars) {
		return `WHERE ${Object.entries(where).map(([k, v]) => {
			if (typeof v === "object") {
				if ("value" in v) {
					vars[`$where_${k}`] = v.value
					return `${k} ${v.op} $where_${k}`
				} else {
					return `${k} ${v.op}`
				}
			} else {
				vars[`$where_${k}`] = v
				return `${k} = $where_${k}`
			}
		}).join(" AND ")}`
	}

	function genOrderSQL(order: OrderCondition) {
		return `ORDER BY ${order.columns.join(", ")}${order.desc ? " DESC" : ""}`
	}

	function genLimitSQL(limit: number, vars: DBVars) {
		vars["$limit"] = limit
		return `LIMIT $limit`
	}

	function genOffsetSQL(offset: number, vars: DBVars) {
		vars["$offset"] = offset
		return `OFFSET $offset`
	}

	// TODO: support multiple values
	function genValuesSQL(data: DBData, vars: DBVars) {
		return `VALUES (${Object.entries(data).map(([k, v]) => {
			vars[`$value_${k}`] = v
			return `$value_${k}`
		}).join(", ")})`
	}

	const specialVars = new Set([
		"CURRENT_TIMESTAMP",
	])

	function genSetSQL(data: DBData, vars: DBVars) {
		return `SET ${Object.entries(data).map(([k, v]) => {
			if (typeof v === "string" && specialVars.has(v)) {
				return `${k} = ${v}`
			} else {
				vars[`$set_${k}`] = v
				return `${k} = $set_${k}`
			}
		}).join(", ")}`
	}

	function genColumnSQL(name: string, opts: ColumnDef) {
		let code = name + " " + opts.type
		if (opts.primaryKey) code += " PRIMARY KEY"
		if (opts.autoIncrement) code += " AUTOINCREMENT"
		if (!opts.allowNull) code += " NOT NULL"
		if (opts.unique) code += " UNIQUE"
		if (opts.default !== undefined) code += ` DEFAULT ${opts.default}`
		if (opts.reference) code += ` REFERENCES ${opts.reference.table}(${opts.reference.column})`
		return code
	}

	function genColumnsSQL(input: Record<string, ColumnDef>) {
		return Object.entries(input)
			.map(([name, opts]) => "    " + genColumnSQL(name, opts))
			.join(",\n")
	}

	function transaction(action: () => void) {
		return bdb.transaction(action)()
	}

	function getTable<D extends DBData>(tableName: string): Table<D> {

		function columnExists(column: string): boolean {
			const stmt = bdb.query<{ count: number }, [ string, string ]>(`
SELECT COUNT(*) as count
FROM pragma_table_info(?)
WHERE name = ?
			`)
			const result = stmt.get(tableName, column)
			if (!result) return false
			return result.count > 0
		}

		const isParanoid = columnExists("time_deleted")

		function getBoolColumns(): string[] {
			const stmt = bdb.query<{
				name: string,
				type: string,
			}, []>(`PRAGMA table_info(${tableName})`)
			const results = stmt.all()
			return results
				.filter(col => col.type.toUpperCase() === "BOOLEAN")
				.map(col => col.name)
		}

		const boolColumns = getBoolColumns()
		const needsTransform = boolColumns.length > 0

		function transformRow(item: any): D {
			if (!needsTransform) return item
			for (const k of boolColumns) {
				item[k] = Boolean(item[k])
			}
			return item
		}

		function transformRows(items: any[]): any[] {
			if (!needsTransform) return items
			return items.map(transformRow)
		}

		// TODO: transform types?
		function select<D2 = D>(opts: SelectOpts = {}): D2[] {
			const vars = {}
			if (isParanoid) {
				opts.where = {
					...(opts.where ?? {}),
					"time_deleted": { op: "IS NULL" },
				}
			}
			if (opts.join) {
				// TODO: support where from join tables
				const colNames = (t: string, cols: ColumnName[] | "*" = "*") => {
					const c = cols === "*" ? ["*"] : cols
					return c
						.filter((name) => name)
						.map((c) => {
							if (typeof c === "string") {
								return `${t}.${c}`
							} else {
								return `${t}.${c.name} AS ${c.as}`
							}
						})
						.join(", ")
				}
				const items = bdb.query(`
SELECT${opts.distinct ? " DISTINCT" : ""} ${colNames(tableName, opts.columns)}, ${opts.join.map((j) => colNames(j.table.name, j.columns)).join(", ")}
FROM ${tableName}
${opts.join.map((j) => `${j.join ? j.join.toUpperCase() + " " : ""}JOIN ${j.table.name} ON ${j.table.name}.${j.on.column} = ${j.on.matchTable.name}.${j.on.matchColumn}`).join("\n")}
${opts.where ? genWhereSQL(opts.where, vars) : ""}
				`).all(vars) ?? []
				return items as D2[]
			}
			const items = bdb.query(`
SELECT${opts.distinct ? " DISTINCT" : ""} ${genColumnNameSQL(opts.columns)}
FROM ${tableName}
${opts.where ? genWhereSQL(opts.where, vars) : ""}
${opts.order ? genOrderSQL(opts.order) : ""}
${opts.limit ? genLimitSQL(opts.limit, vars) : ""}
${opts.offset ? genOffsetSQL(opts.offset, vars) : ""}
			`).all(vars) ?? []
			return transformRows(items) as D2[]
		}

		function count(where?: WhereCondition) {
			const vars = {}
			const stmt = bdb.query(`
SELECT COUNT(*) as count
FROM ${tableName}
${where ? genWhereSQL(where, vars) : ""}
			`)
			// @ts-ignore
			return Number(stmt.get(vars)["count"])
		}

		function findAll<D2 = D>(where: WhereCondition): D2[] {
			return select({
				where: where,
			})
		}

		function find<D2 = D>(where: WhereCondition): D2 {
			return select<D2>({
				where: where,
				limit: 1,
			})[0]
		}

		// TODO: join
		function search(text: string) {
			const sql = `SELECT * FROM ${tableName}_fts WHERE ${tableName}_fts MATCH $query ORDER BY rank`
			return bdb.query(sql).all({
				"$query": text,
			}) as D[] ?? []
		}

		function insert(data: D) {
			if (!data) {
				throw new Error("cannot INSERT into database without table / data")
			}
			const vars = {}
			bdb.query(`
INSERT INTO ${tableName} (${Object.keys(data).join(", ")})
${genValuesSQL(data, vars)}
			`).run(vars)
		}

		function update(data: Partial<D>, where: WhereCondition) {
			const vars = {}
			const keys = Object.keys(data)
			bdb.query(`
UPDATE ${tableName}
${genSetSQL(data as DBData, vars)}
${genWhereSQL(where, vars)}
			`).run(vars)
		}

		function clear() {
			bdb.run(`DELETE FROM ${tableName}`)
		}

		function remove(where: WhereCondition) {
			const vars = {}
			if (isParanoid) {
				// @ts-ignore
				update({
					"time_deleted": "CURRENT_TIMESTAMP",
				}, where)
			} else {
				bdb.query(`
DELETE FROM ${tableName}
${genWhereSQL(where, vars)}
				`).run(vars)
			}
		}

		return {
			name: tableName,
			select,
			find,
			findAll,
			count,
			update,
			insert,
			search,
			delete: remove,
			clear,
		}

	}

	function createTable<D extends DBData>(
		tableName: string,
		schema: TableSchema,
		topts: TableOpts<D> = {}
	): Table<D> {
		if (tableName.endsWith("_fts")) {
			throw new Error("cannot manually operate a fts table")
		}
		bdb.run(`
CREATE TABLE ${tableName} (
${genColumnsSQL({
...schema,
...(topts.timeCreated ? {
"time_created": { type: "TEXT", default: "CURRENT_TIMESTAMP" },
} : {}),
...(topts.timeUpdated ? {
"time_updated": { type: "TEXT", default: "CURRENT_TIMESTAMP" },
} : {}),
...(topts.paranoid ? {
"time_deleted": { type: "TEXT", allowNull: true },
} : {}),
})}
)
		`)
		const pks = []
		const fts = []
		for (const colName in schema) {
			const config = schema[colName]
			if (config.primaryKey) {
				pks.push(colName)
			}
			if (config.index) {
				bdb.run(`
CREATE INDEX idx_${tableName}_${colName} ON ${tableName}(${colName})
				`)
			}
			if (config.fts) {
				fts.push(colName)
			}
		}
		if (topts.timeUpdated) {
			if (pks.length === 0) {
				throw new Error("time updated requires primary key")
			}
			bdb.run(`
CREATE TRIGGER trigger_${tableName}_time_updated
AFTER UPDATE ON ${tableName}
BEGIN
UPDATE ${tableName}
SET time_updated = CURRENT_TIMESTAMP
WHERE ${pks.map((pk) => `${pk} = NEW.${pk}`).join(" AND ")};
END
			`)
		}
		if (fts.length > 0) {
			// TODO: content / content_rowid?
			bdb.run(`
CREATE VIRTUAL TABLE ${tableName}_fts USING fts5 (${[...pks, ...fts].join(", ")})
		`)
		bdb.run(`
CREATE TRIGGER trigger_${tableName}_fts_insert
AFTER INSERT ON ${tableName}
BEGIN
INSERT INTO ${tableName}_fts (${[...pks, ...fts].join(", ")})
VALUES (${[...pks, ...fts].map((c) => `NEW.${c}`).join(", ")});
END
			`)
			bdb.run(`
CREATE TRIGGER trigger_${tableName}_fts_update
AFTER UPDATE ON ${tableName}
BEGIN
UPDATE ${tableName}_fts
SET ${fts.map((c) => `${c} = NEW.${c}`).join(", ")}
WHERE ${pks.map((pk) => `${pk} = NEW.${pk}`).join(" AND ")};
END
			`)
			bdb.run(`
CREATE TRIGGER trigger_${tableName}_fts_delete
AFTER DELETE ON ${tableName}
BEGIN
DELETE FROM ${tableName}_fts
WHERE ${pks.map((pk) => `${pk} = OLD.${pk}`).join(" AND ")};
END
			`)
		}
		const table = getTable<D>(tableName)
		if (topts.initData) {
			for (const row of topts.initData) {
				table.insert(row)
			}
		}
		return table
	}

	function dropTable(name: string) {
		bdb.run(`DROP TABLE ${name}`)
	}

	function table<D extends Record<string, any>>(
		tableName: string,
		schema: TableSchema,
		topts: TableOpts<D> = {}
	): Table<D> {
		const exists = bdb.query(`
SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'
		`).get()
		if (exists) {
			return getTable(tableName)
		} else {
			return createTable(tableName, schema, topts)
		}
	}

	return {
		table,
		getTable,
		createTable,
		dropTable,
		transaction,
		close: bdb.close,
		serialize: bdb.serialize,
	}

}
