import * as Cesium from "cesium"
import axios from "axios";
import X2JS from 'x2js';

import ViewCesiumUtils from "./ViewCesiumUtils"
export default class ImageryLoader {
    constructor() {

    }

    /**加载wms服务
   * @param url 请求地址
   * @param layername 图层名称
   * @param label 标签
   */
    static loadWmsLayer(viewer, url, layerName, label, isChecked) {
        let rectangle = Cesium.Rectangle.fromDegrees(
            Number(112.999997),
            Number(27.333333),
            Number(114.000001),
            Number(28.000057)
        );
        let result = ImageryLoader.wmsLayerIsExist(viewer, layerName);
        if (result.flag) {
            result.obj.show = isChecked;
            // isChecked ? ImageryLoader.setWmsView(viewer, url) : 1;
            if (layerName.indexOf('seic') >= 0 || layerName === "geohazard") {
                isChecked ? ViewCesiumUtils.resetView(
                    viewer,
                    113.805972,
                    27.664014,
                    8000000.0
                ) : 1;
            } else if (layerName.indexOf("hydro") >= 0) {
                isChecked ? ViewCesiumUtils.resetView(
                    viewer,
                    113.444517,
                    28.3255097,
                    220000.0
                ) : 1;
            }

            else {
                isChecked ? viewer.camera.setView({
                    destination: rectangle
                }) : 1;
            }


            return
        }
        let wmsImageLayer = new Cesium.WebMapServiceImageryProvider({
            url: url,
            layers: layerName,
            parameters: {
                transparent: true, //是否透明
                format: "image/png",
                VERSION: "1.1.1",
                srs: "EPSG:4326",
                service: "WMS",
                exceptions: "application/vnd.ogc.se_inimage",
            },
            maximumLevel: 21
        })
        wmsImageLayer.name = layerName;
        wmsImageLayer.label = label;
        viewer.imageryLayers.addImageryProvider(wmsImageLayer)
        if (layerName.indexOf('seic') >= 0 || layerName === "geohazard") {
            ViewCesiumUtils.resetView(
                viewer,
                113.805972,
                27.664014,
                8000000.0
            );
        } else if (layerName.indexOf("hydro") >= 0) {
            ViewCesiumUtils.resetView(
                viewer,
                113.444517,
                28.3255097,
                220000.0
            );
        }
        else {
            viewer.camera.setView({
                destination: rectangle
            })
        }
    }
    // 加载筛选后的wms服务
    static loadSelectWmsLayer(viewer, url, layer, label, cqlStr, lon, lat, geometryType, isChecked) {
        console.log(lon, lat);
        let imageryLayers = viewer.imageryLayers
        let rectangle = Cesium.Rectangle.fromDegrees(
            Number(112.999997),
            Number(27.333333),
            Number(114.000001),
            Number(28.000057)
        );
        let obj = ImageryLoader.wmsLayerIsExist(viewer, "temp" + layer + label);
        if (obj.flag) {
            for (let i = 0; i < imageryLayers._layers.length; i++) {
                if (
                    imageryLayers._layers[i].imageryProvider.name ===
                    "temp" + layer + label
                ) {
                    imageryLayers.remove(imageryLayers._layers[i]);
                    i = -1;
                    if (imageryLayers._layers.length === 1) {
                        return;
                    }
                }
            }
            return;
        }
        let tempStyle = "hlight-ploygon-style";
        if (geometryType === "Point") {
            tempStyle = "hlight-point-style"
        }
        let parameters = {
            transparent: true, //是否透明
            format: "image/png",
            VERSION: "1.1.1",
            srs: "EPSG:4326",
            service: "WMS",
            styles: tempStyle, // 添加自定义样式、统一高亮颜色
            // styles: "point", // 添加自定义样式、统一高亮颜色  这里有个bug线面图层无法适应到面图层
            exceptions: "application/vnd.ogc.se_inimage",
        };
        console.log(cqlStr);
        // if (cqlStr === "" || label === cqlStr) {
        parameters.CQL_FILTER = label;
        // } else {
        // parameters.CQL_FILTER = label + " and " + cqlStr;
        // }
        console.log(parameters);
        let wmsImageLayer = new Cesium.WebMapServiceImageryProvider({
            url: url,
            layers: layer,
            parameters: parameters,
            maximumLevel: 21
        });
        wmsImageLayer.name = "temp" + layer + label;
        wmsImageLayer.label = "筛选后图层信息";
        imageryLayers.addImageryProvider(wmsImageLayer);
        // ImageryLoader.setWmsView(viewer, url);
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 22000),
            orientation: {
                heading: Cesium.Math.toRadians(348.4202942851978),  // 朝向 代表镜头左右方向,正值为右,负值为左,360度和0度是一样的
                pitch: Cesium.Math.toRadians(-89.74026687972041),   // 俯仰角 代表镜头上下方向,正值为上,负值为下.            
                roll: Cesium.Math.toRadians(0), //代表镜头左右倾斜.正值,向右倾斜,负值向左倾斜
            },
            complete: function callback() {
                // 定位完成之后的回调函数
            },
        });
    }
    /**wmsLayer是否存在
    * @param layerName 图层名
    */
    static wmsLayerIsExist(viewer, layerName) {
        let flag = false;
        let obj = null;
        let imageryLayers = viewer.imageryLayers;
        for (let i = 0; i < imageryLayers._layers.length; i++) {
            if (imageryLayers._layers[i].imageryProvider.name === layerName) {
                flag = true;
                obj = imageryLayers._layers[i];
                break;
            }
        }
        return { flag, obj };
    }

    /**加载wfs服务
* @param url 请求地址
* @param layername 图层名称
* @param label 标签
* @param 回调 标签
*/
    static loadWfsLayer(url, layerName, label, callback) {
        axios.$http.get(url).then(async (res) => {
            // res.data就是真是geojson数据
            let dataSource = await Cesium.GeoJsonDataSource.load(res.data);
            dataSource.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            dataSource.name = layerName;
            dataSource.label = label;
            callback(dataSource)
        });

    }
    /**wmsLayer是否存在
* @param layerName 图层名
*/
    static wfsLayerIsExist(viewer, layerName) {
        let flag = false;
        let dataSource = null;
        let dataSourceList = viewer.dataSources._dataSources;
        if (dataSourceList.length === 0) return { flag, dataSource };

        for (let i = 0; i < dataSourceList.length; i++) {
            if (dataSourceList[i].name === layerName) {
                flag = true;
                dataSource = dataSourceList[i];
                break;
            }
        }
        return {
            flag,
            dataSource,
        };
    }

    /**加载arcgis服务
   * @param url 请求地址
   * @param layername 图层名称
   * @param label 标签
   */
    static loadArcgisMapServerLayer(viewer, url, layerName, label, isChecked) {
        let rectangle = Cesium.Rectangle.fromDegrees(
            Number(112.999997),
            Number(27.333333),
            Number(114.000001),
            Number(28.000057)
        );
        let result = ImageryLoader.wmsLayerIsExist(
            viewer,
            layerName
        );
        if (result.flag) {
            viewer.imageryLayers.remove(result.obj);
            isChecked ? viewer.camera.setView({
                destination: rectangle
            }) : 1
            return
        }
        let arcgImageLayer = new Cesium.ArcGisMapServerImageryProvider({
            url: url,
            maximumLevel: 21
        })
        arcgImageLayer.name = layerName;
        arcgImageLayer.label = label;
        viewer.imageryLayers.addImageryProvider(arcgImageLayer)
        viewer.camera.setView({
            destination: rectangle
        })

    }

    // 加载kml
    static loadKmlLayer(viewer, url, layerName, isChecked) {
        // 判断是否加载过kml
        let flagObj = ImageryLoader.kmlSourceIsExist(viewer, layerName);
        if (flagObj.flag) {
            flagObj.dataSource.show = isChecked;
            return;
        }
        let kmlOptions = {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas,
            clampToGround: true, // 开启贴地
        };
        let geocachePromise = Cesium.KmlDataSource.load(url, kmlOptions);
        geocachePromise.then((dataSource) => {
            viewer.flyTo(geocachePromise);
            dataSource.name = layerName;
            viewer.dataSources.add(dataSource);
        });
    }
    static kmlSourceIsExist(viewer, layerName) {
        let flag = false;
        let dataSource = null;
        let dataSourceList = viewer.dataSources._dataSources;
        if (dataSourceList.length === 0) return { flag, dataSource };

        for (let i = 0; i < dataSourceList.length; i++) {
            if (dataSourceList[i].name === layerName) {
                flag = true;
                dataSource = dataSourceList[i];
                break;
            }
        }
        return {
            flag,
            dataSource,
        };
    }

    // 加载广告牌
    static loadBillboardLayer(billboards, position, label, imgUrl) {
        // let image = document.createElement("img");
        // image.src = require("../../assets/images/hole.png");
        // image.onload = (e) => {
        // 异步加载的过程
        if (!billboards) return
        billboards.add({
            position: position,
            image: imgUrl,
            show: true,
            pixelOffset: new Cesium.Cartesian2(0, 0), // default: (0, 0)
            eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0), // default
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
            // scale: 2.0, // default: 1.0
            color: Cesium.Color.LIME, // default: WHITE
            // rotation: Cesium.Math.PI_OVER_FOUR, // default: 0.0
            alignedAxis: Cesium.Cartesian3.ZERO, // default
            // width: 10, // default: undefined
            // height: 10, // default: undefined
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 0.8, 8.0e6, 0.0), //1500米内1.5倍大小，8.0e6外不可见
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            id: label,
        });
    }
    // 判断是否加载过billbords
    static billbordsIsExist(viewer, name) {
        let primitivesList = viewer.scene._primitives._primitives;
        let flagObj = {
            isChecked: false,
            obj: null,
        };
        for (let i = 0; i < primitivesList.length; i++) {
            if (
                primitivesList[i] instanceof Cesium.BillboardCollection &&
                primitivesList[i].name === name
            ) {
                flagObj.isChecked = true;
                flagObj.obj = primitivesList[i];
            }
        }
        return flagObj;
    }
    // 确定一个billbords图层是否加载过
    static judgeIsExistInLayerByName(layer, name) {
        let flagObj = {
            isChecked: false,
            obj: null,
        };
        if (!layer) return flagObj;
        let billboardsList = layer._billboards;
        for (let i = 0; i < billboardsList.length; i++) {
            if (billboardsList[i].id === name) {
                flagObj.isChecked = true;
                flagObj.obj = billboardsList[i];
                break;
            }
        }
        return flagObj;
    }
    // 加载 UrlTemplateImageryProvider
    static loadUrlTemlpateImageryLayer(viewer, url, layerName, isChecked, minimumLevel, maximumLevel) {
        let result = ImageryLoader.wmsLayerIsExist(viewer, layerName);
        if (result.flag) {
            viewer.imageryLayers.remove(result.obj);
            return
        }

        minimumLevel = minimumLevel || 3;
        maximumLevel = maximumLevel || 16;
        let templayer = new Cesium.UrlTemplateImageryProvider({
            url: url,
            minimumLevel: 3,
            maximumLevel: 16,
        });
        templayer.name = layerName;
        viewer.imageryLayers.addImageryProvider(templayer)
        let tempLayerResult = ImageryLoader.wmsLayerIsExist(viewer, 'gdtImgLayer')
        viewer.imageryLayers.lowerToBottom(tempLayerResult.obj);

    }
    static loadGDLayer() {
        let templayer = new Cesium.UrlTemplateImageryProvider(
            {
                url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
                minimumLevel: 3,
                maximumLevel: 16
            }
        );
        templayer.name = "gdtImgLayer";

        return templayer;
    }
    // 加载天地图
    static loadTDMapLayer(viewer, url, layerName, isChecked) {
        let result = ImageryLoader.wmsLayerIsExist(viewer, layerName);
        if (result.flag) {
            viewer.imageryLayers.remove(result.obj);
            return
        }
        const subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
        let wmtsImageLayer = new Cesium.WebMapTileServiceImageryProvider({
            url: url,
            subdomains: subdomains,
            layer: layerName,
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible",
            show: true,
        });
        wmtsImageLayer.name = layerName;
        viewer.imageryLayers.addImageryProvider(wmtsImageLayer);
    }
    // 获取所有feature
    processTileFeatures(tile, callback) {
        let content = tile.content;

        let innerContents = content.innerContents;

        if (Cesium.defined(innerContents)) {
            let length = innerContents.length;

            for (let i = 0; i < length; ++i) {
                this.processContentFeatures(innerContents[i], callback);
            }
        } else {
            this.processContentFeatures(content, callback);
        }
    }
    processContentFeatures(content, callback) {
        let featuresLength = content.featuresLength;

        for (let i = 0; i < featuresLength; ++i) {
            let feature = content.getFeature(i);
            callback(feature);
        }
    }
    static setWmsView(viewer, url) {
        axios
            .get(
                url +
                "?service=wms&version=1.1.1&request=GetCapabilities&&outputFormat=application/json"
            )
            .then((res) => {
                let aa = new X2JS().xml2js(res.data);
                let boxExtent =
                    aa.WMT_MS_Capabilities.Capability.Layer.LatLonBoundingBox;
                if (!boxExtent) return;
                console.log(boxExtent);
                let rectangle = Cesium.Rectangle.fromDegrees(
                    Number(boxExtent._minx),
                    Number(boxExtent._miny),
                    Number(boxExtent._maxx),
                    Number(boxExtent._maxy)
                );
                viewer.camera.setView({
                    destination: rectangle,
                });
            });
    }
    static flytochina(viewer) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                110.435314,
                40.960521,
                8000000.0
            ),
            orientation: {
                heading: Cesium.Math.toRadians(20), //代表镜头左右方向,正值为右,负值为左,360度和0度是一样的
                pitch: Cesium.Math.toRadians(-95), //代表镜头上下方向,正值为上,负值为下.
                roll: Cesium.Math.toRadians(-20), //代表镜头左右倾斜.正值,向右倾斜,负值向左倾斜
            },
            complete: function callback() {
                // 定位完成之后的回调函数
            },
        });
    }
}