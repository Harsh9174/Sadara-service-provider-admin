sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/BusyIndicator","sap/ui/model/json/JSONModel"],function(e,r,o){"use strict";return e.extend("com.ServicesProviders.ServicesProviders.controller.Home",{onInit:function(){var e=sap.ui.require.toUrl("com/ServicesProviders/ServicesProviders/Images/SadaraFurnace-min.jpg"),r;this.getView().setModel(new o({svgLogo:e}))},onServiceProviderPress:function(){var e=this.getOwnerComponent().getRouter();e.navTo("ServiceProvider")},onServicePress:function(){var e=this.getOwnerComponent().getRouter();e.navTo("Services")},onServiceProviderDetailPress:function(){var e=this.getOwnerComponent().getRouter();e.navTo("ServiceProviderDetail")}})});