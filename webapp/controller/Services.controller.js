sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/ServicesProviders/ServicesProviders/util/formatter",
	"sap/m/MessageBox",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
], function (Controller, formatter, MessageBox, exportLibrary, Spreadsheet) {
	"use strict";
	var EdmType = exportLibrary.EdmType;
	return Controller.extend("com.ServicesProviders.ServicesProviders.controller.Services", {
		formatter: formatter,

		onInit: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Services").attachMatched(this._onRouteMatched, this);

		},

		_onRouteMatched: function (oEvent) {
			this.getView().byId("servicesTable").getBinding("rows").refresh();
		},
		handleClose: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("Home");
		},
		onServiceProviderPress: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("ServiceProvider");
		},

		onServiceProviderDetailPress: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("ServiceProviderDetail");
		},

		onSearch: function () {
		this.onGoPress();
		},
		onGoPress: function (evt) {
			var oTable = this.getView().byId("servicesTable");

			var view = this.getView();
			var serviceNameInput = view.byId("servicesnameinput").getValue();
			var deletionFlagInput = view.byId("mydeleteditems").getSelectedKey();
			var selectedItem = view.byId("mydeleteditems").getSelectedItem();
			var deletionFlagInputText = "";

			if (selectedItem) {
				deletionFlagInputText = selectedItem.getText() || "";
			}

			var filters = [];

			// Create filter for SERVICEPROVIDER_NAME if the input is provided
			if (serviceNameInput.length > 0) {
				var filter1 = new sap.ui.model.Filter("tolower(SERVICE_NAME)", sap.ui.model.FilterOperator.Contains, "tolower('" + this.getView()
					.byId("servicesnameinput").getValue() + "')");
				filters.push(filter1);
			}

			// Create filter for DELETIONFLAG if the input is provided
			if (deletionFlagInputText == "Deleted") {
				var filter2 = new sap.ui.model.Filter("DELETIONFLAG", sap.ui.model.FilterOperator.Contains, deletionFlagInput);
				filters.push(filter2);
			} else if (deletionFlagInputText == "Non-Deleted") {
				// If DELETIONFLAG input is not provided, add a default filter
				var filter3 = new sap.ui.model.Filter("DELETIONFLAG", sap.ui.model.FilterOperator.NE, "X");
				filters.push(filter3);
			}

			// Apply the filters to the table binding
			var tableBinding = view.byId("servicesTable").getBinding("rows");

			if (serviceNameInput.length === 0 && deletionFlagInputText === "") {
				// If both inputs are empty, apply an empty filter (remove any existing filters)
				tableBinding.filter([]);
			} else {
				// Apply the combined filters
				tableBinding.filter(filters.length > 0 ? new sap.ui.model.Filter(filters, true) : []);
			}
		},
		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: 'ID',
				property: ['SERVICE_ID'],
				type: EdmType.Number,
				template: '{0}, {1}'
			});

			aCols.push({
				label: 'Provider Name',
				type: EdmType.String,
				property: 'SERVICE_NAME',

			});

			aCols.push({
				property: 'SERVICE_DESCRIPTION',
				type: EdmType.String
			});
			aCols.push({
				property: 'SERVICECATEGORY_ID',
				type: EdmType.String
			});

			aCols.push({
				property: 'CREATIONDATETIME',
				type: EdmType.Date
			});

			aCols.push({
				property: 'CREATEDBY',
				type: EdmType.String
			});

			aCols.push({
				property: 'UPDATEDATETIME',
				type: EdmType.Date,

			});

			aCols.push({
				property: 'UPDATEDBY',
				type: EdmType.String
			});
			aCols.push({
				property: 'DELETIONFLAG',
				type: EdmType.String
			});

			return aCols;
		},
		changeStateUpdateService: function (oEvent) {

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
						if (state) {
							// Code to handle deletion
							console.log("Provider deleted.");
						} else {
							// Code to handle undo-deletion
							console.log("Undo-delete operation performed.");
						}
					} else {
						// Handle the user's cancellation
						// Optionally, revert the switch control state
						switchControl.setState(!state);
					}
				}
			});
		},
		onExport: function () {
			var aCols, oRowBinding, oSettings, oSheet, oTable;

			if (!this._oTable) {
				this._oTable = this.byId('servicesTable');
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
				fileName: 'Service Master.xlsx',
				worker: false,

			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function () {
				oSheet.destroy();
			});
		},
		onEditPress: function () {

			this.oSelectedItem = this.getView().byId("servicesTable").getSelectedIndex();
			if (this.oSelectedItem < 0) {
				MessageBox.error("Please Select a Service to Proceed");
			} else {

				this.selectedItem = this.getView().byId("servicesTable").getContextByIndex(this.oSelectedItem).getObject();

				if (!this.UpdateService) {
					this.UpdateService = new sap.ui.xmlfragment("com.ServicesProviders.ServicesProviders.fragments.UpdateService", this);
					this.getView().addDependent(this.UpdateService);
				}
				var Deletion = true;
				if (this.selectedItem.DELETIONFLAG == "X") {
					Deletion = true;
				} else {
					Deletion = false;
				}

				this.UpdateService.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].setValue(this.selectedItem.SERVICE_NAME)
				this.UpdateService.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].setValue(this.selectedItem.SERVICE_DESCRIPTION)
				this.UpdateService.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].setSelectedKey(this.selectedItem.SERVICECATEGORY_ID)
				this.UpdateService.getContent()[0].getFormContainers()[0].getFormElements()[3].getFields()[0].setState(Deletion)
				this.UpdateService.open();
			}
		},
		onCancel: function () {
			this.UpdateService.close();
		},

		onAddLine: function () {
			if (!this.AddNewService) {
				this.AddNewService = new sap.ui.xmlfragment("com.ServicesProviders.ServicesProviders.fragments.AddNewService", this);
				this.getView().addDependent(this.AddNewService);
			}
			this.AddNewService.open();
		},

		onCancelNewService: function () {
			this.AddNewService.close();
			this.AddNewService.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].setValue();
			this.AddNewService.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].setSelectedKey();
			this.AddNewService.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].setValue("")

		},
		onSave: function () {
			var that = this;
			const oModel = that.getOwnerComponent().getModel("SproviderModel");
			const timestamp = Date.now();
			const odataDate = `\/Date(${timestamp})\/`;
			var sSearchValue = this.AddNewService.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getValue();
			var sSearchValue2 = this.AddNewService.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].getSelectedKey();
			if (!sSearchValue || !sSearchValue2) {
				MessageBox.error("Service or Category Not Selected");
			} else {
				var baseUrl = oModel.sServiceUrl;
				var sServiceURl = "/SERVICESMASTER?$filter=startswith(tolower(SERVICE_NAME),tolower('" + sSearchValue +
					"')) or startswith(tolower(SERVICECATEGORY_ID),('" + sSearchValue2 + "'))";

				// Perform the AJAX call to check if the provider already exists
				$.ajax({
					url: baseUrl + sServiceURl,
					method: "GET",
					dataType: "json",
					success: function (oData) {
						// Process the results and check for existence
						that.aResults = oData.d.results;
						var bExists = false;
						// Iterate through the results to check for duplicates
						that.aResults.forEach(function (oItem) {
							if (oItem.SERVICE_NAME.toLowerCase() === sSearchValue.toLowerCase()) {
								bExists = true; // Set flag if a match is found
							}
						});

						// If provider exists, show a message box
						if (!sSearchValue || !sSearchValue2) {
							MessageBox.error("Service or Service ID Cannot be empty", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Information",
								actions: [MessageBox.Action.OK]
							});
						} else if (bExists) {
							MessageBox.error("Service already exists", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Information",
								actions: [MessageBox.Action.OK]
							});
						} else {

							var GetIDurl = "/ServiceProviderOdata/SDR/ServiceProviders/Application/Services_seq.xsjs"
							$.ajax({
								url: GetIDurl,
								method: "GET",
								dataType: "json",
								success: function (oData) {
									that.highestID = parseInt(oData[0].VALUE)

									var selectedData = {
										"SERVICE_ID": that.highestID,
										"SERVICE_NAME": that.AddNewService.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getValue(),
										"SERVICE_DESCRIPTION": that.AddNewService.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0]
											.getValue(),
										"SERVICECATEGORY_ID": that.AddNewService.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0]
											.getSelectedKey(),
										"CREATIONDATETIME": odataDate,
										"CREATEDBY": sap.ushell.Container.getService("UserInfo").getFullName(),
										"UPDATEDATETIME": null,
										"UPDATEDBY": null,
										"DELETIONFLAG": ""
									};

									that.AddNewService.close();
									// Create new provider entry
									oModel.create("/SERVICESMASTER", selectedData, {
										success: function (odata) {
											MessageBox.success("Service Created Successfully", {
												onClose: function () {

													that.AddNewService.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].setValue("");
													that.AddNewService.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].setSelectedKey();
													that.AddNewService.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].setValue("")
													that.getView().byId("servicesTable").getBinding("rows").refresh();
												}
											});
										},
										error: function (error) {
											console.error("Error creating provider:", error);
											MessageBox.error("An error occurred while creating the Service.");
										}
									});
								},
								error: function () {

								}
							});

						}
					},
					error: function (oError) {
						console.error("Error fetching data:", oError);
						MessageBox.error("An error occurred while checking for provider existence.");
					}
				});
			}
		},
		onUpdate: function () {
			var that = this;
			var ServiceIdToAvoidMatch = this.selectedItem.SERVICE_ID;
			const timestamp = Date.now();
			const odataDate = `/Date(${timestamp})/`;
			const oModel = this.getOwnerComponent().getModel("SproviderModel");
			var baseUrl = oModel.sServiceUrl;
			var sSearchValue = this.UpdateService.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getValue();
			var sSearchValue2 = this.UpdateService.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].getSelectedKey();
			var sServiceURl =
				`/SERVICESMASTER?$filter=startswith(tolower(SERVICE_NAME),tolower('${sSearchValue}')) or startswith(tolower(SERVICECATEGORY_ID),tolower('${sSearchValue2}'))`;
			// Format the timestamp in the OData format
			var bExists = false;

			if (!sSearchValue || !sSearchValue2) {
				MessageBox.information("Servoce or Category ID Cannot be Empty");
			} else {
				$.ajax({
					url: baseUrl + sServiceURl,
					method: "GET",
					dataType: "json",
					success: function (oData) {
						that.aResults = oData.d.results;
						that.aResults.forEach(function (oItem) {
							// Skip matching if the SERVICEPROVIDER_ID matches ProviderIdToAvoidMatch
							if (oItem.SERVICE_ID === ServiceIdToAvoidMatch) {
								return; // Skip this iteration
							}

							// Perform the comparison for other values
							if (oItem.SERVICE_NAME.toLowerCase() === sSearchValue.toLowerCase()) {
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
							var payload = {
								"SERVICE_ID": that.selectedItem.SERVICE_ID,
								"SERVICE_NAME": that.UpdateService.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getValue(),
								"SERVICE_DESCRIPTION": that.UpdateService.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getValue(),
								"SERVICECATEGORY_ID": that.UpdateService.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].getSelectedKey(),
								"CREATIONDATETIME": that.selectedItem.CREATIONDATETIME,
								"CREATEDBY": that.selectedItem.CREATEDBY,
								"UPDATEDATETIME": odataDate,
								"UPDATEDBY": sap.ushell.Container.getService("UserInfo").getFullName(),
								"DELETIONFLAG": that.UpdateService.getContent()[0].getFormContainers()[0].getFormElements()[3].getFields()[0].getState() ?
									"X" : ""
							};
							that.UpdateService.close();
							oModel.update("/SERVICESMASTER(" + that.selectedItem.SERVICE_ID + ")", payload, {
								success: function (data, oResponse) {
									that.getView().byId("servicesTable").getBinding("rows").refresh();

									MessageBox.success("Service Updated Successfully");

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