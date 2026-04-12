level.nodeManager.addNodeTemplate({
    templateName: "init_character_node",
    displayText: "填写您的角色设定",
    description: `在开始前，您需要为自己的角色设定一些基本信息，接下来请在游戏下方节点中填写您角色的设定内容，点击节点中执行互动选项以提交；
    推荐每个设定问题字数在 30 字左右，若您不想填写某个设定，可以留空并提交，系统会为您随机生成一个设定内容；
    （若您完全不想填写这些内容，直接留空以完全随机生成一名角色）`,
    category: "初始设定",
    lifeTimeRounds: 1,
    inputStringBars: new Map([
        ["name", {
            barID: "name",
            inputHint: "您的角色名称",
            inputContent: "",
        }],
        ["impressed_exp", {
            barID: "impressed_exp",
            inputHint: "您的角色在大学生活中最印象深刻的经历",
            inputContent: "",
        }],
        ["attitude_courses", {
            barID: "attitude_courses",
            inputHint: "您的角色对对大学课程的态度",
            inputContent: "",
        }],
        ["extracurricular", {
            barID: "extracurricular",
            inputHint: "您的角色参与的最多的课外活动",
            inputContent: "",
        }],
        ["imm_stuff", {
            barID: "imm_stuff",
            inputHint: "与您的角色关系最密切的随身物品",
            inputContent: "",
        }],
    ]),
    inputCheckboxes: new Map([
        ["gender", {
            boxID: "gender",
            inputHint: "您的角色的性别",
            choices: ["男", "女"],
            chooseIndex: -1,
        }]
    ]),
    interactable: true,
    onInteractCallback: async (context) => {
        const level = context.level;
        const logger = context.logger;
        const node = context.node;
        const account = context.account;

        const characterMap = level.characterManager.getCharactersMap();
        for (const [charId, character] of characterMap) {
            if (level.characterManager.getCharacterType(charId) === "player" && character.accountRecord?.accountId === account.accountId) {
                level.textManager.sendAlertToAccount(level, account,
                    "您已经设定过角色",
                    `您目前正在扮演 ${character.characterName}，若您想重新设定角色，请先通过另一个节点取消设定。`
                )
                return;
            }
        }

        const narrator = level.narratorManager.narrator;
        const response = await narrator.sendTriggerMessage(
            `玩家正在进行角色设定初始化，在初始化中，玩家填写了一些与其角色有关的信息，根据这些信息，若信息符合逻辑，调用 init_character，填入相关信息来完成角色的初始化；若信息中有明显不合理之处，调用 raise_character_expectation 来告知玩家具体的设定问题所在并让玩家重新填写；特别地，如果一个待填写设定中不包含有效信息，应当为玩家随机生成一个。在生成角色时，不应当因为本剧本的心理恐怖主题，而将角色特质设置地过于刻板与浮夸，应当保持尽量现实的人设生成规则。`,
            {
                inputStrings: Object.fromEntries(node.inputStringBars),
                inputCheckboxes: Object.fromEntries(node.inputCheckboxes)
            },
            [
                level.toolManager.getToolSchemaByName("init_character")!,
                level.toolManager.getToolSchemaByName("raise_character_expectation")!
            ]
        )
        try {
            const responseData = await response;
            if (responseData) {
                const toolCalls = responseData.choices[0].message.tool_calls || [];
                await level.toolManager.executeToolCalls(toolCalls, context);
            }
        } catch (error) {
            logger.error(`在执行角色设定初始化时发生错误： ${error}`);
        }
    }
});

level.nodeManager.addNodeTemplate({
    templateName: "cancel_character_node",
    displayText: "取消扮演角色",
    description: `若您已经设定好了您的角色，但想重新设定，或仅仅想放弃扮演角色，您可以点击下方节点中的执行互动选项以取消当前角色设定并删除角色相关信息；`,
    category: "初始设定",
    lifeTimeRounds: 1,
    interactable: true,
    onInteractCallback: async (context) => {
        const level = context.level;
        const logger = context.logger;
        const node = context.node;
        const account = context.account;

        const character = level.characterManager.getCharacterByAccount(account.accountId);
        if (!character) {
            level.textManager.sendAlertToAccount(level, account,
                "没有可取消的角色设定",
                `您当前没有任何角色设定需要取消，您可以通过另一个节点来进行角色设定。`
            )
            return;
        }
        for (const [nodeId, node] of level.nodeManager.getNodesMap()) {
            if (node.displayText === "取消扮演角色") {
                level.nodeManager.deleteRelatedCharacterFromNode(nodeId, character.characterID);
            }
        }
        level.characterManager.detachAccountFromCharacter(character.characterID);
        level.textManager.sendAlertToAccount(level, account,
            "已取消角色设定",
            `您已经成功取消了当前的角色设定，您可以重新填写角色信息来设定新角色，或保持不填以在游戏开始时作为观察者。`
        )
        level.characterManager.removeCharacter(character.characterID);
    }
});