sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/BusyIndicator",
	'sap/ui/model/json/JSONModel'
], function (Controller, BusyIndicator, JSONModel) {
	"use strict";

	return Controller.extend("com.ServicesProviders.ServicesProviders.controller.Home", {
		onInit: function () {
			var svgLogo = sap.ui.require.toUrl("com/ServicesProviders/ServicesProviders/Images/SadaraFurnace-min.jpg"),
				oImgModel;

			this.getView().setModel(new JSONModel({

				svgLogo: svgLogo
			}));
		},
		onServiceProviderPress: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("ServiceProvider");
		},
		onServicePress: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("Services");
		},
		onServiceProviderDetailPress: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("ServiceProviderDetail");
		}

	});
});