import type { ToolContext } from '../../types/scripts/managers/toolManager';
import type { AccountRecord } from '../../types/services/dataManger';

data["status"] = {
    stageStatus: "prepare" as "prepare" | "progress" | "finish",
}

level.hookManager.storyInitEvent = (context: ToolContext) => {
    const level = context.level;
    const logger = context.logger;
    data["status"]["stageStatus"] = "prepare";
    const initCharacterNode = level.nodeManager.createNode("init_character_node");
    const cancelCharacterNode = level.nodeManager.createNode("cancel_character_node");
    level.nodeManager.addNode(initCharacterNode);
    level.nodeManager.addNode(cancelCharacterNode);

    level.narratorManager.narrator.setNarratorProfile(data["texts"]["narratorProfile"]);
    level.narratorManager.narrator.loadLLMAPIKey();
}

level.hookManager.storyAdvanceEvent = async (context: ToolContext) => {
    const level = context.level;
    const logger = context.logger;
    if (data["status"]["stageStatus"] === "prepare") {
        let canProceed = level.characterManager.getCharactersMap().size > 0;
        if (!canProceed) {
            for (const accountId of level.onlineAccounts) {
                const account = level.getAccountFromId(accountId);
                if (account) {
                    level.textManager.sendAlertToAccount(level, account,
                        "无法开始这场故事",
                        "至少需要有一名玩家完成角色设定才能进入下一阶段。"
                    )
                }
            }
            level.currRound = 0;
            return;
        } else {
            data["status"]["stageStatus"] = "progress";
            // 在此加入真正的故事开始时的逻辑，这就复杂了
            await new Promise(resolve => setTimeout(resolve, 1000));
            level.nodeManager.clearNodes();
            for (const accountId of level.onlineAccounts) {
                const account = level.getAccountFromId(accountId);
                if (account) {
                    level.textManager.sendTitleLeadInToAccount(level, account, data["texts"]["progressStageTitle"], data["texts"]["progressStageSubtitle"], 1000, 500);
                    level.textManager.sendAlertToAccount(level, account, data["texts"]["introTitle"], data["texts"]["intro0"]);
                }
            }
        }
    }
}

level.hookManager.playerConnectEvent = (
    context: ToolContext,
    account: AccountRecord
) => {
    const level = context.level;
    const logger = context.logger;
    if (data["status"]["stageStatus"] === "prepare") {
        level.textManager.sendTitleLeadInToAccount(level, account, data["texts"]["prepareStageTitle"], data["texts"]["prepareStageSubtitle"], 1000, 500);
        level.textManager.sendAlertToAccount(level, account, data["texts"]["preludeTitle"], data["texts"]["prelude"]);
        level.textManager.sendAlertToAccount(level, account, data["texts"]["preludeTitle"], data["texts"]["prepareStageDescription"]);
    }
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