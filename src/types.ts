type Canvas = HTMLCanvasElement;
type Context = CanvasRenderingContext2D;
type FillStyle = string | CanvasGradient | CanvasPattern;
type StrokeStyle = string | CanvasGradient | CanvasPattern

enum Side {left = -1, right = 1}

enum NodeType {
    spool, start, end, block, finish, isolator
}

interface GameObject {

}

type Color = { r: number, g: number, b: number, a: number }

interface Connector {
    pos: Vec2;
    size: number;
}

type Activatable = Connector & {
    active?: boolean;
}

type HasPosition = { pos: Vec2; }

type Spool = HasPosition & { size: number; }
// interface Spool extends  Connector {
//     hover?: boolean;
// }

type Vec2 = {
    x: number;
    y: number;
};

type PositionComponent = {
    pos: Vec2;
}

type SpoolComponent = {
    type: NodeType;
    size: number;
    isAttached?:boolean;
    powered?: boolean;
    overpowered?: boolean;
}

type BlockComponent = {
    size: number;
}
type IsolatorComponent = {
    size: number;
}

type RenderComponent = {
    type: NodeType
    hover?: boolean
}
type InputComponent = {
    inputSize: number
}
type Attachment = { entity: SpoolEntity, side: Side; inPos?: Vec2, outPos?: Vec2, isolated?:boolean, overlap?:boolean }
type MouseDragComponent = { size: number };
type CableComponent = {
    attachments: Attachment[];
    overpowered?: boolean;
}

type FinishComponent = { connected?: boolean };
type Entity = {
    pos: Vec2;
    spool: SpoolComponent;
    block: BlockComponent;
    input: InputComponent;
    render: RenderComponent;
    isolator: IsolatorComponent;
    cable: CableComponent;
    mouseDrag: MouseDragComponent;
    finish: FinishComponent;
    // startNode?: EndNode;
    // EndNodeNode?: EndNode;
}

type SpoolEntity = Pick<Entity, 'pos' | 'spool'>;
type SpoolNodeEntity = Pick<Entity, 'render'> & SpoolEntity;
type StartNodeEntity = Pick<Entity, 'pos' | 'spool' | 'render'>;
type EndNodeEntity = Pick<Entity, 'pos' | 'spool' | 'render' | 'mouseDrag'>;
type CableEntity = Pick<Entity, 'cable'>;
type RenderEntity = Pick<Entity, 'render'>;
type MouseDragEntity = Pick<Entity, 'mouseDrag' | 'pos'>;
type FinishEntity = Pick<Entity, 'finish' | 'render' | 'pos'>;
type BlockEntity = Pick<Entity, 'block' | 'pos'>;
type BlockNodeEntity = Pick<Entity, 'render'> & BlockEntity;
type IsolatorEntity = Pick<Entity, 'pos' | 'render' | 'isolator' >;

// TODO: do i need to differentiate between NodeEntity and Entity?! don't think so, remove NodeEntity

/*
    Start
        HasPosition
        StartNode
        Spool
    End
        HasPosition
        Spool
        MouseEvents
        DragConnector
     Finish
        HasPosition
        FinishNode
     Spool
        HasPosition
        Spool



 */

