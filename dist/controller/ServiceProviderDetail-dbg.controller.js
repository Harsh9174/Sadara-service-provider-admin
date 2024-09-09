sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/ServicesProviders/ServicesProviders/util/formatter",
	"sap/m/MessageBox",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
], function (Controller, formatter, MessageBox, exportLibrary, Spreadsheet) {
	"use strict";
	var EdmType = exportLibrary.EdmType;
	return Controller.extend("com.ServicesProviders.ServicesProviders.controller.ServiceProviderDetail", {
		formatter: formatter,

		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ServiceProviderDetail").attachMatched(this._onRouteMatched, this);
		},
		handleClose: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("Home");
		},
		onServiceProviderPress: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("ServiceProvider");
		},
		onServicePress: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("Services");
		},

		_onRouteMatched: function (oEvent) {
			this.getView().byId("table1").getBinding("rows").refresh();
		},

		onSearch: function () {
			this.onGoPress();
		},

		onSearchService: function () {
			var servicename = this.getView().byId("searchservice").getValue();
			var view = this.getView();

			var filters = [];

			if (servicename.length > 0) {
				var filter1 = new sap.ui.model.Filter("tolower(SERVICE_NAME)", sap.ui.model.FilterOperator.Contains, "tolower('" + this.getView()
					.byId("searchservice").getValue() + "')");
				filters.push(filter1);
			}
			// Apply the filters to the table binding
			var tableBinding = view.byId("table1").getBinding("rows");
			if (servicename.length === 0) {
				// If both inputs are empty, apply an empty filter (remove any existing filters)
				tableBinding.filter([]);
			} else {
				// Apply the combined filters
				tableBinding.filter(filters.length > 0 ? new sap.ui.model.Filter(filters, true) : []);
			}
		},

		onGoPress: function (evt) {
			var view = this.getView();
			var oTable = view.byId("table1");
			// Get input values
			var serviceProviderNameInput = view.byId("searchprovider").getValue().toLowerCase(); // Convert input to lower case
			var serviceInput = view.byId("searchservice").getValue().toLowerCase(); // Convert input to lower case
			var deletionFlagInput = view.byId("deleteditemsindetails").getSelectedKey();
			var selectedItem = view.byId("deleteditemsindetails").getSelectedItem();
			var deletionFlagInputText = selectedItem ? selectedItem.getText() : "";

			// Initialize filter array
			var filters = [];

			// Create filter for SERVICEPROVIDER_NAME if input is provided
			if (serviceProviderNameInput.length > 0) {
				var filter1 = new sap.ui.model.Filter(
					"tolower(SERVICEPROVIDER_NAME)", // Apply tolower on field name
					sap.ui.model.FilterOperator.Contains,
					"tolower('" + serviceProviderNameInput + "')"
				);
				filters.push(filter1);
			}

			// Create filter for SERVICE_NAME if input is provided
			if (serviceInput.length > 0) {
				var filter2 = new sap.ui.model.Filter(
					"tolower(SERVICE_NAME)", // Apply tolower on field name
					sap.ui.model.FilterOperator.Contains,
					"tolower('" + serviceInput + "')"
				);
				filters.push(filter2);
			}

			// Create filter for DELETIONFLAG if input is provided
			if (deletionFlagInputText === "Deleted") {
				var filter3 = new sap.ui.model.Filter(
					"DELETIONFLAG",
					sap.ui.model.FilterOperator.Contains,
					deletionFlagInput
				);
				filters.push(filter3);
			} else if (deletionFlagInputText === "Non-Deleted") {
				var filter4 = new sap.ui.model.Filter(
					"DELETIONFLAG",
					sap.ui.model.FilterOperator.NE,
					"X"
				);
				filters.push(filter4);
			}

			// Get the table binding and apply filters
			var tableBinding = oTable.getBinding("rows");

			if (serviceProviderNameInput.length === 0 && serviceInput.length === 0 && deletionFlagInputText === "") {
				// If all inputs are empty, remove all filters
				tableBinding.filter([]);
			} else {
				// Apply the combined filters
				tableBinding.filter(new sap.ui.model.Filter(filters, true));
			}
		},

		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: 'ID',
				property: ['SERVICEPROVIDER_ID'],
				type: EdmType.Number,
				template: '{0}, {1}'
			});

			aCols.push({
				label: 'Provider Name',
				type: EdmType.String,
				property: 'SERVICEPROVIDER_NAME',

			});

			aCols.push({
				property: 'SADARAVENDOR_ID',
				type: EdmType.String
			});

			aCols.push({
				property: 'SERVICE_ID',
				type: EdmType.String
			});

			aCols.push({
				property: 'SERVICE_NAME',
				type: EdmType.String
			});

			aCols.push({
				property: 'SERVICE_DESCRIPTION',
				type: EdmType.String
			});

			aCols.push({
				property: 'SERVICECATEGORY_ID',
				type: EdmType.String,

			});

			aCols.push({
				property: 'REMARKS',
				type: EdmType.String
			});

			aCols.push({
				property: 'SERVICEPROVIDER_CREATEDBY',
				type: EdmType.String
			});

			aCols.push({
				property: 'SERVICEPROVIDER_CREATIONDATETIME',
				type: EdmType.Date
			});

			aCols.push({
				property: 'SERVICEPROVIDER_UPDATEDATETIME',
				type: EdmType.Date
			});

			aCols.push({
				property: 'SERVICEPROVIDER_UPDATEDBY',
				type: EdmType.String
			});

			aCols.push({
				property: 'SERVICE_CREATEDBY',
				type: EdmType.String
			});

			aCols.push({
				property: 'SERVICE_CREATIONDATETIME',
				type: EdmType.Date
			});

			aCols.push({
				property: 'SERVICE_UPDATEDATETIME',
				type: EdmType.Date
			});

			aCols.push({
				property: 'SERVICE_UPDATEDBY',
				type: EdmType.String
			});

			aCols.push({
				property: 'DELETIONFLAG',
				type: EdmType.String,
			});

			return aCols;
		},

		onExport: function () {
			var aCols, oRowBinding, oSettings, oSheet, oTable;
			if (!this._oTable) {
				this._oTable = this.byId('table1');
			}

			oTable = this._oTable;
			oRowBinding = oTable.getBinding('rows');
			aCols = this.createColumnConfig();

			oSettings = {
				workbook: {
					count: 5,
					columns: aCols,
					hierarchyLevel: 'Level'
				},
				dataSource: oRowBinding,
				type: "odata",
				fileName: 'Service Provider Details.xlsx',
				worker: false,

			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function () {
				oSheet.destroy();
			});
		},
		AddProvider: function () {
			if (!this.AddProviderDetails) {
				this.AddProviderDetails = new sap.ui.xmlfragment("com.ServicesProviders.ServicesProviders.fragments.AddProviderDetails", this);
				this.getView().addDependent(this.AddProviderDetails);
			}

			this.AddProviderDetails.open();
			this.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].refreshItems
			this.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].refreshItems

		},
		onCancel: function () {
			this.AddProviderDetails.close();
			this.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].setValue("")
			this.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].setValue("")
			this.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].setValue("")
		},
		onCancelUpdateDetails: function () {
			this.UpdateProviderDetails.close();
		},
		changeStateUpdateDetails: function (oEvent) {
			var switchControl = oEvent.getSource(); // Get the switch control that triggered the event
			var state = switchControl.getState(); // Get the new state of the switch (true or false)

			// Define the message based on the state
			var message = state ?
				"Are you sure you want to delete the provider?" :
				"Are you sure you want to undo-delete the provider?";

			// Define the title and buttons for the MessageBox
			var title = state ? "Confirm Deletion" : "Confirm Undo-Deletion";

			// Show the MessageBox with the confirmation message
			sap.m.MessageBox.confirm(message, {
				title: title,
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						// Handle the user's confirmation
					} else {
						// Handle the user's cancellation
						// revert the switch control state
						switchControl.setState(!state);
					}
				}
			});
		},
		onSave: function () {
			var that = this;
			const timestamp = Date.now();
			const odataDate = `/Date(${timestamp})/`;
			const oModel = this.getOwnerComponent().getModel("SproviderModel");
			var baseUrl = oModel.sServiceUrl;
			var ServiceProvideId = this.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getSelectedKey();
			var ServiceId = this.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getSelectedKey();
			var Remarks = this.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].getValue();

			if (!ServiceProvideId || !ServiceId) {
				MessageBox.error("Provider or Service Not Selected");
			} else {
				var sSearchValue = this.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getSelectedItem()
					.getText();
				var sSearchValue2 = this.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getSelectedItem()
					.getText();
				var sServiceURl =
					`/CV_PROVIDER_DETAILS?$filter=startswith(tolower(SERVICEPROVIDER_NAME),tolower('${sSearchValue}')) or startswith(tolower(SERVICE_NAME),tolower('${sSearchValue2}'))`;
				var bExists = false;
				$.ajax({
					url: baseUrl + sServiceURl,
					method: "GET",
					dataType: "json",
					success: function (oData) {
						that.aResults = oData.d.results;
						that.aResults.forEach(function (oItem) {

							// Perform the comparison for other values
							if (oItem.SERVICEPROVIDER_NAME.toLowerCase() === sSearchValue.toLowerCase() &&
								oItem.SERVICE_NAME.toLowerCase() === sSearchValue2.toLowerCase()) {
								bExists = true; // Set flag if a match is found
							}
						});

						if (bExists) {
							MessageBox.error("Service Provider or Service already Exists", {
								icon: MessageBox.Icon.ERROR,
								title: "Error",
								actions: [MessageBox.Action.OK]
							});
						} else {
							var oModel = that.getOwnerComponent().getModel("SproviderModel");
							var Details = {
								"SERVICEPROVIDER_ID": ServiceProvideId,
								"SERVICE_ID": ServiceId,
								"REMARKS": Remarks,
								"CREATIONDATETIME": odataDate,
								"CREATEDBY": sap.ushell.Container.getService("UserInfo").getFullName(),
								"UPDATEDATETIME": null,
								"UPDATEDBY": null,
								"DELETIONFLAG": "",
								"UUID": globalThis.crypto.randomUUID(),

							};
							that.AddProviderDetails.close();
							oModel.create("/SERVICEPROVIDERDETAILS", Details, {
								success: function (oData) {
									MessageBox.success("Details Created Successfully");
									that.getView().byId("table1").getBinding("rows").refresh();
									that.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].setValue("")
									that.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].setValue("")
									that.AddProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].setValue("");
								},
								error: function (error) {
									// Handle error
								}
							});
						}
					},
					error: function () {
						// Handle error
					}
				});
			}
		},

		onEditPress: function () {
			this.oSelectedItem = this.getView().byId("table1").getSelectedIndex();

			if (this.oSelectedItem < 0) {
				MessageBox.error("Please Select a Service Provider Detail to Proceed");
			} else {

				this.selectedItem = this.getView().byId("table1").getContextByIndex(this.oSelectedItem).getObject();
				if (!this.UpdateProviderDetails) {
					this.UpdateProviderDetails = new sap.ui.xmlfragment("com.ServicesProviders.ServicesProviders.fragments.UpdateProviderDetails",
						this);
					this.getView().addDependent(this.UpdateProviderDetails);
				}
				this.UpdateProviderDetails.open();
				this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].refreshItems
				this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].refreshItems

				var Deletion = true;
				if (this.selectedItem.DELETIONFLAG == "X") {
					Deletion = true;
				} else {
					Deletion = false;
				}
				var providerid = this.selectedItem.SERVICEPROVIDER_ID || "";
				this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getBinding("items").refresh();
				this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getBinding("items").refresh();
				this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].setSelectedKey(this.selectedItem
					.SERVICEPROVIDER_ID)
				this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].setSelectedKey(this.selectedItem
					.SERVICE_ID)
				this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].setValue(this.selectedItem.REMARKS)
				this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[3].getFields()[0].setState(Deletion)
			}
		},

		onUpdate: function () {
			var that = this;
			const timestamp = Date.now();
			const odataDate = `/Date(${timestamp})/`;
			const oModel = this.getOwnerComponent().getModel("SproviderModel");
			var baseUrl = oModel.sServiceUrl;
			var ServiceProvideId = this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getSelectedKey();
			var ServiceId = this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getSelectedKey();
			var Remarks = this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].getValue();

			if (!ServiceProvideId || !ServiceId) {
				MessageBox.error("Provider or Service Not Selected");
			} else {
				var sSearchValue = this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getSelectedItem()
					.getText();
				var sSearchValue2 = this.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getSelectedItem()
					.getText();
				var sServiceURl =
					`/CV_PROVIDER_DETAILS?$filter=startswith(tolower(SERVICEPROVIDER_NAME ),tolower('${sSearchValue}')) or startswith(tolower(SERVICE_NAME),tolower('${sSearchValue2}'))`;
				var bExists = false;
				$.ajax({
					url: baseUrl + sServiceURl,
					method: "GET",
					dataType: "json",
					success: function (oData) {
						that.aResults = oData.d.results;
						that.aResults.forEach(function (oItem) {
							// Skip matching if the SERVICEPROVIDER_ID matches ProviderIdToAvoidMatch
							if (oItem.UUID === that.selectedItem.UUID) {
								return; // Skip this iteration
							}

							// Perform the comparison for other values
							if (oItem.SERVICEPROVIDER_NAME.toLowerCase() === sSearchValue.toLowerCase() &&
								oItem.SERVICE_NAME.toLowerCase() === sSearchValue2.toLowerCase()) {
								bExists = true; // Set flag if a match is found
							}
						});

						if (bExists) {
							MessageBox.error("Service or Category ID already Exists", {
								icon: MessageBox.Icon.ERROR,
								title: "Information",
								actions: [MessageBox.Action.OK]
							});
						} else {
							var oModel = that.getOwnerComponent().getModel("SproviderModel");
							var Details = {
								"SERVICEPROVIDER_ID": ServiceProvideId,
								"SERVICE_ID": ServiceId,
								"REMARKS": Remarks,
								"CREATIONDATETIME": null,
								"CREATEDBY": null,
								"UPDATEDATETIME": odataDate,
								"UPDATEDBY": sap.ushell.Container.getService("UserInfo").getFullName(),
								"DELETIONFLAG": that.UpdateProviderDetails.getContent()[0].getFormContainers()[0].getFormElements()[3].getFields()[0].getState() ?
									"X" : "",
								"UUID": that.selectedItem.UUID,

							};
							that.UpdateProviderDetails.close();
							oModel.update("/SERVICEPROVIDERDETAILS('" + that.selectedItem.UUID + "')", Details, {
								success: function (oData) {
									MessageBox.success("Details Updated Successfully");
									that.getView().byId("table1").getBinding("rows").refresh();

								},
								error: function (error) {
									// Handle error
								}
							});
						}
					},
					error: function () {
						// Handle error
					}
				});
			}
		}
	});
});