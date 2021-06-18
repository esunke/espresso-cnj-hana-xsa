sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createNewJokeModel: function () {
			var oNewJokeModel = new sap.ui.model.json.JSONModel();
			oNewJokeModel.setDefaultBindingMode("TwoWay");
			oNewJokeModel.loadData("/node/jokes");
			return oNewJokeModel;
		},
		createStatisticModel: function () {
			var oJokeStatistics = new sap.ui.model.json.JSONModel();
			oJokeStatistics.setDefaultBindingMode("OneWay");
			oJokeStatistics.loadData("/python");
			return oJokeStatistics;
		},
	};
});