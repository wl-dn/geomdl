import * as Cesium from "cesium"

export default class TerrainLoader {
    constructor() {

    }
    loadLocalTerrain(url, viewer,isChecked) {
        const scene = viewer.scene;
        let terrainProvider = null;
        if (!isChecked) {
            terrainProvider = new Cesium.EllipsoidTerrainProvider({});
        } else {
            terrainProvider = new Cesium.CesiumTerrainProvider({
                url: url,
                requestWaterMask: true,
            });
        }
        scene.terrainProvider = terrainProvider;
    }
}