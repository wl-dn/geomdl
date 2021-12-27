/*
 * @Descripttion: cesium中viewer的类
 * @Author: wenlong
 * @version: 
 * @Date: 2021-08-19 11:05:19
 * @LastEditors: wenlong
 * @LastEditTime: 2021-08-23 14:54:33
 */
import * as Cesium from "cesium"
export default class ViewCesiumUtils {
    constructor() {
    }
    /**
     * @descripttion:初始化cesium
     * @param {void}
     * @return {void}
     */
    static initCesium(showWedgit) {
        let viewerOption = {
            geocoder: showWedgit, // 地理位置查询定位控件
            homeButton: showWedgit, // 默认相机位置控件
            timeline: showWedgit, // 时间滚动条控件
            navigationHelpButton: showWedgit, // 默认的相机控制提示控件
            sceneModePicker: showWedgit, // 切换2D、3D和Columbus View（CV）模式
            fullscreenButton: showWedgit, // 全屏控件
            creditsDisplay: showWedgit, //展示商标版权和数据源
            // scene3DOnly: true, // 每个几何实例仅以3D渲染以节省GPU内存.与sceneModePiker不能共存
            baseLayerPicker: showWedgit, // 底图切换控件
            animation: showWedgit, // 控制场景动画的播放速度控件
        };
        return viewerOption;
    }
    // 放大
    static zoomOut(viewer) {
        // 获取当前镜头位置的笛卡尔坐标
        let cameraPos = viewer.camera.position;
        // 获取当前坐标系标准
        let ellipsoid = viewer.scene.globe.ellipsoid;
        // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
        let cartographic = ellipsoid.cartesianToCartographic(cameraPos);
        // 获取镜头的高度
        let height = cartographic.height;
        // 根据上面当前镜头的位置，获取该中心位置的经纬度坐标
        let centerLon = parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(8));
        let centerLat = parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(8));

        // 镜头拉远
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, height / 1.8),
            duration: 1.0
        });

    }
    // 缩小
    static zoomIn(viewer) {
        // 获取当前镜头位置的笛卡尔坐标
        let cameraPos = viewer.camera.position;
        // 获取当前坐标系标准
        let ellipsoid = viewer.scene.globe.ellipsoid;
        // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
        let cartographic = ellipsoid.cartesianToCartographic(cameraPos);
        // 获取镜头的高度
        let height = cartographic.height;
        // 根据上面当前镜头的位置，获取该中心位置的经纬度坐标
        let centerLon = parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(8));
        let centerLat = parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(8));
        // 镜头拉近
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, height * 1.8),
            duration: 1.0
        });
    }
    // 复位
    static resetView(viewer, lon, lat, height, heading, pitch, roll) {
        heading = heading || 348.4202942851978
        pitch = pitch || -89.74026687972041
        roll = roll || 0
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
            orientation: {
                heading: Cesium.Math.toRadians(heading),  // 朝向 代表镜头左右方向,正值为右,负值为左,360度和0度是一样的
                pitch: Cesium.Math.toRadians(pitch),   // 俯仰角 代表镜头上下方向,正值为上,负值为下.            
                roll: Cesium.Math.toRadians(roll), //代表镜头左右倾斜.正值,向右倾斜,负值向左倾斜
            },
            complete: function callback() {
                // 定位完成之后的回调函数
            },
        });
    }
    static taggleUnderSpace(viewer) {
        viewer.scene.screenSpaceCameraController.enableCollisionDetection =
            !viewer.scene.screenSpaceCameraController.enableCollisionDetection;
    }
    // 全屏/退出
    static taggleFullScreen(active) {
        active
            ? Cesium.Fullscreen.requestFullscreen(document.body)
            : Cesium.Fullscreen.exitFullscreen();
    }
    static taggleEarthShow(viewer) {
        viewer.scene.globe.show = !viewer.scene.globe.show;
        // 修改背景颜色
        // viewer.scene.skyBox.show = false;
        // viewer.scene.sun.show = false;
        // viewer.scene.moon.show = false;
        // viewer.scene.undergroundMode = true; //重要，开启地下模式，设置基色透明，这样就看不见黑色地球了
        // viewer.scene.globe.baseColor = new Cesium.Color(0, 0, 0, 0);
        // viewer.scene.backgroundcolor = new Cesium.Color(0, 0, 0, 0);
    }
    // 改变透明度
    static changeTerrainAlpha(viewer, alpha) {
        viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue =
            Cesium.Math.clamp(alpha, 0.0, 1.0);
    }
    // 获取树的所有叶节点
    static getTreeLayerData(listData, layerData) {
        if (listData.children) {
            for (let i = 0; i < listData.children.length; i++) {
                const listItem = listData.children[i];
                this.createTreeLayerData(listItem, layerData);
            }
        } else {
            const dataItem = JSON.parse(JSON.stringify(listData))
            layerData.push(dataItem);
            return
        }
    }

    // 根据高度回去对应的级别
    static getMapLevel(height) {
        if (height > 48000000) {
            return 0;
        } else if (height > 24000000) {
            return 1;
        } else if (height > 12000000) {
            return 2;
        } else if (height > 6000000) {
            return 3;
        } else if (height > 3000000) {
            return 4;
        } else if (height > 1500000) {
            return 5;
        } else if (height > 750000) {
            return 6;
        } else if (height > 375000) {
            return 7;
        } else if (height > 187500) {
            return 8;
        } else if (height > 93750) {
            return 9;
        } else if (height > 46875) {
            return 10;
        } else if (height > 23437.5) {
            return 11;
        } else if (height > 11718.75) {
            return 12;
        } else if (height > 5859.38) {
            return 13;
        } else if (height > 2929.69) {
            return 14;
        } else if (height > 1464.84) {
            return 15;
        } else if (height > 732.42) {
            return 16;
        } else if (height > 366.21) {
            return 17;
        } else {
            return 18;
        }
    }
    static createGrid(viewer) {
        const entities = viewer.entities;
        //每隔1读绘制一条经度线和经度标注,自己控制间隔
        for (let lang = -180; lang <= 180; lang += 1) {
            let text = "";
            if (lang === 0) {
                text = "0";
            }
            text += lang === 0 ? "" : "" + lang + "°";
            if (lang === -180) {
                text = "";
            }

            entities.add({
                position: Cesium.Cartesian3.fromDegrees(lang, 0),
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArray([
                        lang,
                        -90,
                        lang,
                        0,
                        lang,
                        90,
                    ]),
                    width: 1.0,
                    material: Cesium.Color.YELLOW,
                    clampToGround: true,
                },
                label: {
                    text: text,
                    verticalOrigin: Cesium.VerticalOrigin.TOP,
                    font: "12px sans-serif",
                    fillColor: Cesium.Color.WHITE,
                },
                name: "uniqueGridland" + lang
            });
        }
        //纬度
        let langS = [];
        for (let lang = -180; lang <= 180; lang += 5) {
            langS.push(lang);
        }
        //每隔10读绘制一条纬度线和纬度标注,自己控制间隔
        for (let lat = -80; lat <= 80; lat += 1) {
            let text = "";
            text += "" + lat + "°";
            if (lat === 0) {
                text = "";
            }
            entities.add({
                position: Cesium.Cartesian3.fromDegrees(0, lat),
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArray(
                        langS
                            .map((long) => {
                                return [long, lat].join(",");
                            })
                            .join(",")
                            .split(",")
                            .map((item) => Number(item))
                    ),
                    width: 1.0,
                    material: Cesium.Color.YELLOW,
                    clampToGround: true,
                },
                label: {
                    text: text,
                    font: "12px sans-serif",
                    fillColor: Cesium.Color.WHITE,
                },
                name: "uniqueGridlat" + lat
            });
        }

    }
    static clearGrid(viewer) {
        let entities = viewer.entities._entities.values;
        for (let i = 0; i < entities.length; i++) {
            if (entities[i]._name.indexOf("uniqueGrid") >= 0) {
                viewer.entities.remove(entities[i])
                i = -1;
            }
        }
    }

}