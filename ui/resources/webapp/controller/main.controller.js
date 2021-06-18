sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"de/espresso/ui/model/models"
], function (Controller, MessageToast, Filter, FilterOperator, models) {
	"use strict";
	return Controller.extend("de.espresso.ui.controller.main", {
		onInit: function () {
			
		},

		onAfterRendering: function() {
			this.jokeItemBinding = this.byId("idJokeTable").getBinding("items");
			this.jokeItemBinding.attachCreateCompleted(function(oDataEvent) {
				if (oDataEvent.getParameters().success) {
					MessageToast.show("Joke added successful!");
				} else {
					MessageToast.show("Error: Something went wrong. Please try again later.");
				}				
			});
		},

		_getCreateDialog: function () {
			if (!this._oCreateDialog) {
				this._oCreateDialog = sap.ui.xmlfragment("de.espresso.ui.view.fragments.create", this);
				this.getView().addDependent(this._oCreateDialog);
			}
			return this._oCreateDialog;
		},
		_getStatDialog: function () {
			if (!this._oStatDialog) {
				this._oStatDialog = sap.ui.xmlfragment("de.espresso.ui.view.fragments.statistic", this);
				this.getView().addDependent(this._oStatDialog);
			}
			return this._oStatDialog;
		},
		_getUserDialog: function () {
			if (!this._oUserDialog) {
				this._oUserDialog = sap.ui.xmlfragment("de.espresso.ui.view.fragments.showuserinfo", this);
				this.getView().addDependent(this._oUserDialog);
			}
			return this._oUserDialog; 
		},

		onCreateNewJoke: function () {
			var oNewJokeModel = models.createNewJokeModel();
			this.getView().setModel(oNewJokeModel, "newJokes");
			this._getCreateDialog().open();
		},
		onGetStatistics: function () {
			var oJokeStatistics = models.createStatisticModel()
			this.getView().setModel(oJokeStatistics, "jokeStatistics");
			this._getStatDialog().open();
		},
		onGetUserInfo: function () {
			this._getUserDialog().open();

		},

		onCloseStatisticsPressed: function () {
			this._oStatDialog.close();
		},
		onCloseNewJokePressed: function () {
			this._oCreateDialog.close();
			this._oCreateDialog.destroy();
			this._oCreateDialog = null;
		},
		onCloseUserInfoPressed: function () {
			this._oUserDialog.close();
		},

		onSaveJoke: function (oEvent) {
			this.jokeItemBinding.create({
				"api_id": this.getView().getModel("newJokes").getProperty("/id"),
				"text": this.getView().getModel("newJokes").getProperty("/text"),
				"review": parseInt(this.getView().getModel("newJokes").getProperty("/review"))
			});
			this.onCloseNewJokePressed();
		},

		onFilterJokes: function (oEvent) {

			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("text", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oTable = this.getView().byId("idJokeTable");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilter);
		}
	});
});