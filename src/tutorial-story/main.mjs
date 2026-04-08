/** @typedef {import('../../types/scripts/managers/toolManager').ToolContext} ToolContext */
/** @typedef {import('../../types/services/dataManger').AccountRecord} AccountRecord */

level.hookManager.storyInitEvent = (/** @type {ToolContext} */ context) => {
    const level = context.level;
    const logger = context.logger;
}

level.hookManager.storyAdvanceEvent = (/** @type {ToolContext} */ context) => {
    const level = context.level;
    const logger = context.logger;
    if (level.currRound === 1) {
        level.guideManager.sendGuideMessageToLevel(level, "做的不错",
            `目前的教程是你单人进行游玩的，但是在多人游玩时，仅在每名玩家都准备结束回合，游戏才会实际推进到下一回合，这一点需要注意。`);
        level.guideManager.sendGuideMessageToLevel(level, "交互界面",
            `让我们来观察交互界面的最右方，即“故事文本与聊天”区域，`);
        level.guideManager.sendGuideMessageToLevel(level, "故事文本与聊天",
            `这个区域是故事文本显示的主要区域，游戏的剧情文本会显示在这里；当有多个玩家时，玩家之间的聊天消息也会显示在这里。`);
        level.guideManager.sendGuideMessageToLevel(level, "故事文本与聊天",
            `为了更好地演示这个区域，现将以一实际故事情景进行演示，请进入下一回合。`);
    };
    if (level.currRound === 2) {
        const storyIntro = ``;
        level.updateNewContextMessage({
            sender: "",
            content: storyIntro,
            timestamp: Date.now(),
            sendType: "system",
        })
        level.guideManager.sendGuideMessageToLevel(level, "故事文本与聊天",
            `通常而言，每个章节开始时的重要过渡剧情会像刚才这样以弹窗形式展示在屏幕中央，同时附着在故事文本与聊天区域的最新位置，
            在正式游戏中，本部分下方引导栏也将展示角色的自我独白，而非此处的教程文本（前提是你并非旁观者）。`);
        level.guideManager.sendGuideMessageToLevel(level, "扮演角色",
            `在剧情中`);
    };
    if (level.currRound === 3) {
    }
}

level.hookManager.playerConnectEvent = (
    /** @type {ToolContext} */ context,
    /** @type {AccountRecord} */ account
) => {
    const level = context.level;
    const logger = context.logger;
    level.guideManager.sendGuideMessageToAccount(level, account, "欢迎！",
        `Next Prompt 是一个在线文字冒险游戏，其游戏剧情和其它部分要素由 LLM 实时生成。本教程旨在帮助你快速了解游戏的基本玩法和界面。
        本部分区域是引导栏，它会指导你进行接下来的操作；按下下一条来查看接下来的引导信息。`);
    level.guideManager.sendGuideMessageToAccount(level, account, "回合制游戏",
        `作为文字冒险游戏，剧情文本的推进是回合制的，每个回合被称作一个“段落”，推进到新的段落一般会伴随着剧情文本的更新；
        要结束目前的回合，点击操作界面的左下角的准备结束回合按钮。现在尝试结束本段落以继续教程。`);
}

level.hookManager.playerDisconnectEvent = (
    /** @type {ToolContext} */ context,
    /** @type {AccountRecord} */ account
) => {
    const level = context.level;
    const logger = context.logger;
    level.currRound = 0;
    level.nodeManager.nodes.clear();
}

let readyTimes = 4;
level.hookManager.playerSetReadyEvent = (
    /** @type {ToolContext} */ context,
    /** @type {AccountRecord} */ account
) => {
    const level = context.level;
    const logger = context.logger;
    if (readyTimes > 0) {
        level.hookManager.playerSetReadyStatus(context, account, false);
        level.textManager.sendNotifyToAccount(level, account, "测试取消准备", `应当再准备 ${readyTimes} 次`);
        readyTimes--;
    }
    else {
        level.textManager.sendNotifyToAccount(level, account, "准备结束回合", "你真闲啊");
    }
}

level.hookManager.playerSetUnreadyEvent = (
    /** @type {ToolContext} */ context,
    /** @type {AccountRecord} */ account
) => {
    const level = context.level;
    const logger = context.logger;
}