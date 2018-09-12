
const createSpoolRenderSystem = (resources: Resources): RenderSystem => {
    const entities: Entity[] = [];
    const {coils, blocks, isolators, drag, finish, start} = resources;

    return {
        addEntity: (entity: Entity) => {
            if (entity.render) {
                entities.push(entity);
            }
        },
        render: (context: Context, time: number) => {
            entities.forEach(entity => {
                switch (entity.render.type) {
                    case NodeType.spool:
                        context.drawImage(coils[entity.spool.size], entity.pos.x - entity.spool.size - 6, entity.pos.y - entity.spool.size - 6);
                        context.drawImage(resources.led, entity.pos.x - 11, entity.pos.y - 11);
                        if (entity.spool.overpowered) {
                            context.drawImage(resources.redGlow, entity.pos.x - 40, entity.pos.y - 40);
                        } else if (entity.spool.powered) {
                            context.drawImage(resources.greenGlow, entity.pos.x - 40, entity.pos.y - 40);
                        }
                        break;
                    case NodeType.isolator:
                        context.drawImage(isolators[entity.spool.size], entity.pos.x - entity.spool.size - 6, entity.pos.y - entity.spool.size - 6);
                        break;
                    case NodeType.block:
                        context.save();
                        context.translate(entity.pos.x, entity.pos.y);
                        context.rotate(time);
                        const sprite = blocks[entity.block.size];
                        context.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
                        context.restore();
                        break;
                    case NodeType.finish:
                        context.drawImage(finish, entity.pos.x - 32, entity.pos.y - 32);
                        break;
                    case NodeType.start:
                        context.drawImage(start, entity.pos.x - 24, entity.pos.y - 24);
                        break;
                    case NodeType.end:
                        context.drawImage(drag, entity.pos.x - 32, entity.pos.y - 32);
                        if (entity.render.hover) {
                            context.globalAlpha = 0.8 + (0.2 * Math.sin(time * 6));
                            context.drawImage(resources.dragGlow, entity.pos.x - 31, entity.pos.y - 31);
                        } else {
                            context.globalAlpha = 0.2 + (0.2 * Math.sin(time * 3));
                            context.drawImage(resources.dragGlow, entity.pos.x - 31, entity.pos.y - 31);
                        }
                        context.globalAlpha = 1;
                        break;

                }
            });
        }
    };
};

const createCableRenderSystem = (): RenderSystem => {
    const entities: Entity[] = [];
    return {
        addEntity: (entity: Entity) => {
            if (entity.cable) {
                entities.push(entity);
            }
        },
        render: (context: Context) => {

            entities.forEach(entity => {
                const attachments = entity.cable.attachments;
                for (let i = 0; i < attachments.length - 1; i++) {
                    const a = attachments[i];
                    const b = attachments[i + 1];

                    context.save();

                    if (a.overlap) {
                        context.setLineDash([5, 10]);
                    }
                    if (a.isolated) {
                        context.strokeStyle = '#d04533';
                        context.lineWidth = 5;
                    } else {
                        context.strokeStyle = 'white';
                        context.lineWidth = 3;
                    }

                    context.lineCap = 'round';
                    context.beginPath();
                    context.moveTo(a.outPos!.x, a.outPos!.y);
                    context.lineTo(b.inPos!.x, b.inPos!.y);
                    context.stroke();

                    context.restore();
                }
            });
        }
    };
};
