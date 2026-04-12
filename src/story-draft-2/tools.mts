import type GameCharacter from "../../types/scripts/gameObjects/gameCharacter";
import type GameNode from "../../types/scripts/gameObjects/gameNode";
import { type AccountRecord } from "../../types/services/dataManger";

level.toolManager.registerLLMTool(
    "init_character",
    "根据玩家输入的角色设定内容，生成一个角色的基础游戏信息，并将玩家与该角色绑定",
    {
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "玩家角色的名称"
        },
        "age": {
            "type": "integer",
            "description": "玩家角色的年龄",
            "minimum": 16,
            "maximum": 24
        },
        "gender": {
            "type": "string",
            "description": "玩家角色的性别",
            "enum": ["男", "女"]
        },
        "short_description": {
            "type": "string",
            "description": "玩家角色的简短描述，将被展示在玩家列表中，建议控制在 30 字以内，应当包含玩家的基本外貌特征。"
        },
        "personal_introduction": {
            "type": "string",
            "description": "玩家角色的个人介绍，将被展示给玩家，用于下一步的剧情生成，应当包含玩家的性格特征、过往关键经历、人际关系等信息，建议控制在 150 字以内。"
        },
        "attributes": {
            "type": "object",
            "description": "玩家角色的六维属性数值，数值越高表示该属性在玩家身上的表现越明显，应当依据玩家的设定内容进行合理分配",
            "properties": {
                "wonder": {
                    "type": "integer",
                    "description": "玩家角色的惊奇属性数值，数值越高表示玩家在大学生活中表现出更强烈的好奇心和对新鲜事物的兴趣",
                    "minimum": 1,
                    "maximum": 20
                },
                "love": {
                    "type": "integer",
                    "description": "玩家角色的爱属性数值，数值越高表示玩家在大学生活中表现出更强烈的爱心和对他人的关怀",
                    "minimum": 1,
                    "maximum": 20
                },
                "anger": {
                    "type": "integer",
                    "description": "玩家角色的憎恨属性数值，数值越高表示玩家在大学生活中表现出更强烈的愤怒情绪和对不公正现象的反感",
                    "minimum": 1,
                    "maximum": 20
                },
                "desire": {
                    "type": "integer",
                    "description": "玩家角色的欲望属性数值，数值越高表示玩家在大学生活中表现出更强烈的欲望和追求成功的动力",
                    "minimum": 1,
                    "maximum": 20
                },
                "happiness": {
                    "type": "integer",
                    "description": "玩家角色的快乐属性数值，数值越高表示玩家在大学生活中表现出更强烈的快乐情绪和满足感",
                    "minimum": 1,
                    "maximum": 20
                },
                "sadness": {
                    "type": "integer",
                    "description": "玩家角色的悲伤属性数值，数值越高表示玩家在大学生活中表现出更强烈的悲伤情绪和失落感",
                    "minimum": 1,
                    "maximum": 20
                }
            },
            "required": [
                "wonder",
                "love",
                "anger",
                "desire",
                "happiness",
                "sadness"
            ]
        },
        "intimate_item_title": {
            "type": "string",
            "description": "与玩家角色关系最密切的随身物品的名称，依据玩家的描述内容进行合理设定"
        },
        "intimate_item_description": {
            "type": "string",
            "description": "与玩家角色关系最密切的随身物品的描述，依据玩家的描述内容进行合理设定"
        }
    },
    "required": [
        "name",
        "age",
        "gender",
        "short_description",
        "personal_introduction",
        "attributes",
        "intimate_item_title",
        "intimate_item_description"
    ]
    },
    async (args, context) => {
        const level = context.level;
        const logger = context.logger;
        const node : GameNode = context.node;
        const account : AccountRecord = context.account;

        const newCharacter = level.characterManager.registerCharacterInstance(args.name, args.short_description);
        newCharacter.setAttribute("情感：惊奇", args.attributes.wonder);
        newCharacter.setAttribute("情感：爱心", args.attributes.love);
        newCharacter.setAttribute("情感：憎恨", args.attributes.anger);
        newCharacter.setAttribute("情感：欲望", args.attributes.desire);
        newCharacter.setAttribute("情感：快乐", args.attributes.happiness);
        newCharacter.setAttribute("情感：悲伤", args.attributes.sadness);
        newCharacter.setAttribute("行动力", 6);
        newCharacter.setAttribute("精神力", 50);
        newCharacter.setAttribute("理智", 50);

        newCharacter.storage = {
            wonder: args.attributes.wonder,
            love: args.attributes.love,
            anger: args.attributes.anger,
            desire: args.attributes.desire,
            happiness: args.attributes.happiness,
            sadness: args.attributes.sadness,
            actionPoints: 6,
            mentalPower: 50,
            sanity: 50,
        };

        level.characterManager.addCharacter(newCharacter);
        level.characterManager.attachAccountToCharacter(newCharacter.characterID, account);

        level.textManager.sendAlertToAccount(level, account, "角色设定完成", `
            ${args.name} 将是您在本剧本中扮演的角色；

            ${args.personal_introduction}

            您的角色最突出的情感特质是 ${Object.entries(args.attributes).sort((a : [string, number], b: [string, number]) => b[1] - a[1])[0][0]}；

            您的角色的情感特质评分为
            ${Object.entries(args.attributes).map(([key, value]) => `${key}：${value}`).join("，")}；

            您的角色关系最密切的随身物品是 ${args.intimate_item_title}
            
            ${args.intimate_item_description}。

            `);

        for (const [nodeId, node] of level.nodeManager.getNodesMap()) {
            if (node.displayText === "取消扮演角色") {
                level.nodeManager.addRelatedCharacterToNode(nodeId, newCharacter.characterID);
            }
        }
    }
)

level.toolManager.registerLLMTool(
    "raise_character_expectation",
    "根据玩家输入的角色设定内容，判断玩家输入的设定有明显不合理之处",
    {
        "type": "object",
        "properties": {
            "reason": {
                "type": "string",
                "description": "玩家输入的设定内容中明显不合理之处的具体原因描述"
            }
        },
        "required": [
            "reason"
        ],
    },
    async (args, context) => {
        const level = context.level;
        const logger = context.logger;
        const node : GameNode = context.node;
        const account : AccountRecord = context.account;
        level.textManager.sendAlertToAccount(level, account, "角色设定有不合理之处", `您输入的角色设定内容中有以下不合理之处：
            ${args.reason || "???"}
            您应当根据提示修改后重新提交角色设定。`);
    }
)