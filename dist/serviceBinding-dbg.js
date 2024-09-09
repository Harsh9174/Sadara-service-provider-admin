function initModel() {
	var sUrl = "/ServiceProviderOdata/SDR/ServiceProviders/Application/Service.xsodata/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}