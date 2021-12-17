const attributeCompare = {
    // 地层（岩体）分布
    "geostratumzone": new Map([
        ["geostratumtype", "地层(岩性)类别"],
        ["geostratumname", "地层(岩性)时代"],
        ["geostratumsymbol", "地层(岩性)符号"],
        ["rocktype", "岩性种类"],
        ["rockname", "岩性名称"],
        ["rockstructure", "岩性构造"],
        ["rocktexture", "岩性结构"],
        ["rockcolor", "岩石颜色"],
        ["source", "数据来源"],
        ["remarks", "备注"],
    ]),
    // 产状
    "occurrence": new Map([
        ["occurrencentype", "产状类型"],
        ["dip", "倾向"],
        ["dip_ang", "倾角"],
        ["source", "数据来源"],
        ["remarks", "备注"]
    ]),
    // 地层界线分布
    "geoboundzone": new Map([
        ["geoboundcontact", "地质界线类型"],
        ["source", "数据来源"],
        ["remarks", "备注"]
    ]),
    // 断层构造分布
    "faultzone": new Map([
        ["faulttype", "断层类型"],
        ["faultname", "断层名称"],
        ["faulteras", "断层时代"],
        ["faulttrend", "断层走向"],
        ["faultdirection", "断层倾向"],
        ["faultangle", "断层倾角"],
        ["faultrocktype", "断层充填情况"],
        ["source", "数据来源"],
        ["remarks", "备注"],
        ["landform", "地形地貌"],
        ["landformtype", "岩溶谷地"],
        ["source", "数据来源"],
        ["remarks", "备注"]
    ]),
    // // 围岩蚀变地层
    "aterationp": new Map([
        ["alterationptype", "围岩蚀变地层"],
        ["MineralPType", "矿物种类"],
        ["source", "数据来源"],
        ["remarks", "备注"],
    ]),
    // // 围岩蚀变点
    "aterationt": new Map([
        ['alterationttype', '蚀变类型'],
        ['MineraltType', '矿物类型'],
        ['source', '数据来源'],
        ["remarks", "备注"],
    ]),
    // // 地形地貌
    "landform": new Map([
        ['landformtype', '岩溶谷地'],
        ['source', '数据来源'],
        ['remarks', '备注']
    ]),
    // // 矿产开发及采空区
    "minegoaf": new Map([
        ["minegoaftype", "矿产开发及采空区类型"],
        ['source', '数据来源'],
        ["remarks", "备注"],
    ]),
    // // 特殊岩体
    "specialrocksoil": new Map([
        ['specialrocksoiltype', "填土"],
        ['source', '数据来源'],
        ["remarks", "备注"],
    ]),
    // // 不良地质
    "unfavorablegeology": new Map([
        ['unfavorablegeologytype', "不良地质类型"],
        ['source', '数据来源'],
        ["remarks", "备注"],
    ]),
    // 钻孔点位信息
    "pointInfo": new Map([
        ["borename", "勘探点名称"],
        ["boretype", "勘探点类型"],
        ["worksitename", "工点名称"],
        ["prefix", "里程冠号"],
        ["sectionnum", "里程值"],
        ["offset", "偏距"],
        ["borex", "经距"],
        ["borey", "纬距"],
        ["borelon", "经度"],
        ["borelat", "纬度"],
        ["boreheight", "孔口标高"],
        ["bore_depth", "钻孔深度"],
        ["recorder", "记录人"],
        ["recorddate", "记录日期"],
        ["checker", "核查人"],
        ["checkdate", "核查日期"],
        ["remarks", "备注"]
    ]),
    // // 剖面地层信息
    "secMdl": new Map([
        ["profilegeostratumcode", "地层(岩性)符号"],
        ["profilegeostratumera", "地层(岩性年代"],
        ["profilegeostratumname", "地层(岩性)时代名称"],
        ["profilelithology", "岩性名称"],
        ["soilrockclassify", "土石类别"],
        ["weathering", "风化程度"],
        ["dipangle", "倾角"],
        ["dipdirection", "倾向"],
        ["apparentdipangle", "视倾角"],
        ["source", "数据来源"],
        ["remarks", "备注"],
    ]),
    // // 剖面地质界线
    "secLine": new Map([
        ["boundarytype", "剖面地质界线类型"],
        ["dipangle", "倾角"],
        ["dipdirection", "倾向"],
        ["apparentdipangle", "视倾角"],
        ["source", "数据来源"],
        ["remarks", "备注"]
    ])
}

export default attributeCompare