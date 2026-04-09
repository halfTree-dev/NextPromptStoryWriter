import type { ToolContext } from '../../types/scripts/managers/toolManager';
import type { AccountRecord } from '../../types/services/dataManger';

level.hookManager.storyInitEvent = (context: ToolContext) => {
    const level = context.level;
    const logger = context.logger;
}

level.hookManager.storyAdvanceEvent = (context: ToolContext) => {
    const level = context.level;
    const logger = context.logger;
}

level.hookManager.playerConnectEvent = (
    context: ToolContext,
    account: AccountRecord
) => {
    const level = context.level;
    const logger = context.logger;
}

level.hookManager.playerDisconnectEvent = (
    context: ToolContext,
    account: AccountRecord
) => {
    const level = context.level;
    const logger = context.logger;
}

level.hookManager.playerSetReadyEvent = (
    context: ToolContext,
    account: AccountRecord
) => { 
    const level = context.level;
    const logger = context.logger;
}

level.hookManager.playerSetUnreadyEvent = (
    context: ToolContext,
    account: AccountRecord
) => {
    const level = context.level;
    const logger = context.logger;
}