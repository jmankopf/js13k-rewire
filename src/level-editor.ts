const createLevelEditorSystem = (space: Space, inputControl: InputControl): UpdateSystem => {
    const mouseWheelListener = (e: WheelEvent) => {
        e.preventDefault();
        const spool = (inputControl.targets[0][0] as Entity).spool || (inputControl.targets[0][0] as Entity).block;

        if (!spool) {
            return;
        }
        let min = 30;
        let max = 160;
        if (spool.type == NodeType.isolator) {
            max = 80;
        }

        if (e.deltaY < 0) {
            spool.size !== max && (spool.size += 10);
        } else {
            spool.size !== min && (spool.size -= 10);
        }
    };

    const keydownListener = (e: KeyboardEvent) => {
        if (e.key === '1') {
            const spoolEntity: SpoolNodeEntity = {
                pos: {x: inputControl.mousePos.x - 1, y: inputControl.mousePos.y},
                spool: {size: 50, type: NodeType.spool},
                render: {type: NodeType.spool},
            };
            // (spoolEntity as any).mouseDrag = {size: 20};
            space.addEntity(spoolEntity);
        }
        if (e.key === '2') {
            const spoolEntity: BlockNodeEntity = {
                pos: {x: inputControl.mousePos.x, y: inputControl.mousePos.y},
                block: {size: 50},
                render: {type: NodeType.block},
            };
            // (spoolEntity as any).mouseDrag = {size: 20};
            space.addEntity(spoolEntity);
        }
        if (e.key === '3') {
            const spoolEntity: SpoolNodeEntity = {
                pos: {x: inputControl.mousePos.x, y: inputControl.mousePos.y},
                spool: {size: 40, type: NodeType.isolator},
                render: {type: NodeType.isolator},
            };
            // (spoolEntity as any).mouseDrag = {size: 20};
            space.addEntity(spoolEntity);
        }
        if (e.key === 'F2') {
            const level: Partial<LevelData> = {spools: [], isolators: [], blocks: []};
            space.entities.forEach(entity => {
                if (entity.spool) {
                    switch (entity.spool.type) {
                        case NodeType.spool:
                            level.spools!.push([entity.pos!.x, entity.pos!.y, entity.spool.size]);
                            break;
                        case NodeType.start:
                            level.start = [entity.pos!.x, entity.pos!.y];
                            break;
                        case NodeType.end:
                            level.end = [110, 360];
                            break;
                        case NodeType.isolator:
                            level.isolators!.push([entity.pos!.x, entity.pos!.y, entity.spool!.size]);
                            break;
                    }
                }
                if (entity.finish) {
                    level.finish = [entity.pos!.x, entity.pos!.y];
                }
                if (entity.block) {
                    level.blocks!.push([entity.pos!.x, entity.pos!.y, entity.block.size]);
                }
            });

            console.log(JSON.stringify(level));
        }
    };

    window.addEventListener('keydown', keydownListener);
    window.addEventListener('wheel', mouseWheelListener);

    return {
        addEntity: entity => {
            if (entity.spool) {
                if (entity.spool.type != NodeType.end) {
                    entity.mouseDrag = {size: entity.spool.size};
                }

            }
            if (entity.block) {
                entity.mouseDrag = {size: entity.block.size};
            }
        },
        update: (time: number) => {
        },
        shutdown: () => {
            window.removeEventListener('keydown', keydownListener);
        }
    };
};
