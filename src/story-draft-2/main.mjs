/** @typedef {import('../../types/scripts/managers/toolManager').ToolContext} ToolContext */
/** @typedef {import('../../types/services/dataManger').AccountRecord} AccountRecord */

level.hookManager.storyInitEvent = (/** @type {ToolContext} */ context) => {
    const level = context.level;
    const logger = context.logger;
}

level.hookManager.storyAdvanceEvent = (/** @type {ToolContext} */ context) => {
    const level = context.level;
    const logger = context.logger;
}

level.hookManager.playerConnectEvent = (
    /** @type {ToolContext} */ context,
    /** @type {AccountRecord} */ account
) => {
    const level = context.level;
    const logger = context.logger;
}

level.hookManager.playerDisconnectEvent = (
    /** @type {ToolContext} */ context,
    /** @type {AccountRecord} */ account
) => {
    const level = context.level;
    const logger = context.logger;
}

level.hookManager.playerSetReadyEvent = (
    /** @type {ToolContext} */ context,
    /** @type {AccountRecord} */ account
) => {
    const level = context.level;
    const logger = context.logger;
}

level.hookManager.playerSetUnreadyEvent = (
    /** @type {ToolContext} */ context,
    /** @type {AccountRecord} */ account
) => {
    const level = context.level;
    const logger = context.logger;
}