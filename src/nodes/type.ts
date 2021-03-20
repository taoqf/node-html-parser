export enum NodeType {
	ELEMENT_NODE = 1,
	TEXT_NODE = 3,
	COMMENT_NODE = 8
}

export type SourceLocation = {
	start: number,
	end?: number,
}

export type NodeOptions = {
	start?: number,
	end?: number,
}
