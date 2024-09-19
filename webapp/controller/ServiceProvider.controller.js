sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/ServicesProviders/ServicesProviders/util/formatter",
	"sap/m/MessageBox",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',

], function (Controller, formatter, MessageBox, exportLibrary, Spreadsheet) {
	"use strict";
	var EdmType = exportLibrary.EdmType;
	return Controller.extend("com.ServicesProviders.ServicesProviders.controller.ServiceProvider", {
		formatter: formatter,

		onInit: function () {
			this.localModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.localModel, "localModel");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ServiceProvider").attachMatched(this._onRouteMatched, this);
			// this._loadXLSXLib().then(function (XLSX) {
			// 	this.XLSX = XLSX;
			// }.bind(this)).catch(function (error) {
			// 	console.error("Failed to load XLSX library:", error);
		

		},
		handleClose: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("Home");
		},
		onServicePress: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("Services");
		},
		onServiceProviderDetailPress: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("ServiceProviderDetail");
		},

		onSearch: function () {
			this.onGoPress();
		},

		_onRouteMatched: function (oEvent) {
			this.getView().byId("productsTable").getBinding("rows").refresh();
		},

		onGoPress: function (evt) {
			var oTable = this.getView().byId("productsTable");
			var view = this.getView();
			var serviceProviderNameInput = view.byId("articleMultiInput1").getValue();
			var deletionFlagInput = view.byId("mydeleteditems").getSelectedKey();
			var selectedItem = view.byId("mydeleteditems").getSelectedItem();
			var deletionFlagInputText = "";
			if (selectedItem) {
				deletionFlagInputText = selectedItem.getText() || "";
			}

			var filters = [];
			// Create filter for SERVICEPROVIDER_NAME if the input is provided
			if (serviceProviderNameInput.length > 0) {
				var filter1 = new sap.ui.model.Filter("tolower(SERVICEPROVIDER_NAME)", sap.ui.model.FilterOperator.Contains, "tolower('" + this.getView()
					.byId("articleMultiInput1").getValue() + "')");
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
			var tableBinding = view.byId("productsTable").getBinding("rows");

			if (serviceProviderNameInput.length === 0 && deletionFlagInputText === "") {
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
				property: 'PROVIDER_CATEGORY',
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
				type: EdmType.String,
			});

			return aCols;

		},

		onExport: function () {
			var aCols, oRowBinding, oSettings, oSheet, oTable;

			if (!this._oTable) {
				this._oTable = this.byId('productsTable');
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
				fileName: 'Provider Master.xlsx',
				worker: false,

			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function () {
				oSheet.destroy();
			});
		},

		onEditPress: function () {

			this.oSelectedItem = this.getView().byId("productsTable").getSelectedIndex();

			if (this.oSelectedItem < 0) {
				MessageBox.error("Please Select a Service Provider to Proceed");
			} else {

				this.selectedItem = this.getView().byId("productsTable").getContextByIndex(this.oSelectedItem).getObject();

				if (!this.UpdateProvider) {
					this.UpdateProvider = new sap.ui.xmlfragment("com.ServicesProviders.ServicesProviders.fragments.UpdateProvider", this);
					this.getView().addDependent(this.UpdateProvider);
				}
				var Deletion = true;
				if (this.selectedItem.DELETIONFLAG == "X") {
					Deletion = true;
				} else {
					Deletion = false;
				}

				this.UpdateProvider.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].setValue(this.selectedItem.SERVICEPROVIDER_NAME)
				this.UpdateProvider.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].setValue(this.selectedItem.SADARAVENDOR_ID)
				this.UpdateProvider.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].setValue(this.selectedItem.PROVIDER_CATEGORY)                   
				this.UpdateProvider.getContent()[0].getFormContainers()[0].getFormElements()[3].getFields()[0].setState(Deletion)
				this.UpdateProvider.open();
			}
		},

		onCancel: function () {
			this.UpdateProvider.close();
		},

		changeDeleteStateUpdateProvider: function (oEvent) {

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

		AddProvider: function () {

			if (!this.AddNewProvider) {
				this.AddNewProvider = new sap.ui.xmlfragment("com.ServicesProviders.ServicesProviders.fragments.AddNewProvider", this);
				this.getView().addDependent(this.AddNewProvider);
			}
			this.AddNewProvider.open();
		},

		onCancelNewProvider: function () {
			this.AddNewProvider.close();
			this.AddNewProvider.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].setValue();
			this.AddNewProvider.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].setValue();
		},

		onSave: function () {
			var that = this;
			const oModel = that.getOwnerComponent().getModel("SproviderModel");
			const timestamp = Date.now();
			const odataDate = `\/Date(${timestamp})\/`;
			var sSearchValue = this.AddNewProvider.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getValue();
			var sSearchValue2 = this.AddNewProvider.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getValue();
			var baseUrl = oModel.sServiceUrl;
			var sServiceURl = "/SERVICEPROVIDERMASTER?$filter=startswith(tolower(SERVICEPROVIDER_NAME),tolower('" + sSearchValue +
				"')) or startswith(tolower(SADARAVENDOR_ID),tolower('" + sSearchValue2 + "'))";

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
						if (oItem.SERVICEPROVIDER_NAME.toLowerCase() === sSearchValue.toLowerCase() || oItem.SADARAVENDOR_ID.toLowerCase() ===
							sSearchValue2.toLowerCase()) {
							bExists = true; // Set flag if a match is found
						}
					});

					// If provider exists, show a message box
					if (!sSearchValue || !sSearchValue2) {
						MessageBox.error("Provider or Vendor ID Cannot be empty", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Information",
							actions: [MessageBox.Action.OK]
						});
					} else if (bExists) {
						MessageBox.error("Provider or Vendor ID already exists", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Information",
							actions: [MessageBox.Action.OK]
						});
					} else {

						var GetIDurl = "/ServiceProviderOdata/SDR/ServiceProviders/Application/ServiceProviders_seq.xsjs"
						$.ajax({
							url: GetIDurl,
							method: "GET",
							dataType: "json",
							success: function (oData) {
								that.highestID = parseInt(oData[0].VALUE)

								var selectedData = {
									"SERVICEPROVIDER_ID": that.highestID,
									"SERVICEPROVIDER_NAME": that.AddNewProvider.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0]
										.getValue(),
									"SADARAVENDOR_ID": that.AddNewProvider.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getValue(),
									"CREATIONDATETIME": odataDate,
									"CREATEDBY": sap.ushell.Container.getService("UserInfo").getFullName(),
									"UPDATEDATETIME": null,
									"UPDATEDBY": null,
									"DELETIONFLAG": "",
									"PROVIDER_CATEGORY":that.AddNewProvider.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].getSelectedKey(),
								};

								// Remove last added item if needed
								that.AddNewProvider.close();
								// Create new provider entry
								oModel.create("/SERVICEPROVIDERMASTER", selectedData, {
									success: function (odata) {
										MessageBox.success("Provider Created Successfully", {
											onClose: function () {
												// that.getView().byId("deletebutton-1").setEnabled(true);

												that.AddNewProvider.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].setValue();
												that.AddNewProvider.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].setValue();
												that.AddNewProvider.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].setSelectedKey(),
												that.getView().byId("productsTable").getBinding("rows").refresh();
											}
										});
									},
									error: function (error) {
										console.error("Error creating provider:", error);
										MessageBox.error("An error occurred while creating the provider.");
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
		},

		onUpdate: function () {
			var that = this;
			var ProviderIdToAvoidMatch = this.selectedItem.SERVICEPROVIDER_ID;
			const timestamp = Date.now();
			const odataDate = `/Date(${timestamp})/`;
			const oModel = this.getOwnerComponent().getModel("SproviderModel");
			var baseUrl = oModel.sServiceUrl;
			var sSearchValue = this.UpdateProvider.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getValue();
			var sSearchValue2 = this.UpdateProvider.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getValue();
			var sServiceURl =
				`/SERVICEPROVIDERMASTER?$filter=startswith(tolower(SERVICEPROVIDER_NAME),tolower('${sSearchValue}')) or startswith(tolower(SADARAVENDOR_ID),tolower('${sSearchValue2}'))`;

			// Format the timestamp in the OData format
			var bExists = false;

			if (!sSearchValue || !sSearchValue2) {
				MessageBox.information("Provider or Vendor ID Cannot be Empty");
			} else {
				$.ajax({
					url: baseUrl + sServiceURl,
					method: "GET",
					dataType: "json",
					success: function (oData) {
						that.aResults = oData.d.results;
						that.aResults.forEach(function (oItem) {
							// Skip matching if the SERVICEPROVIDER_ID matches ProviderIdToAvoidMatch
							if (oItem.SERVICEPROVIDER_ID === ProviderIdToAvoidMatch) {
								return; // Skip this iteration
							}

							// Perform the comparison for other values
							if (oItem.SERVICEPROVIDER_NAME.toLowerCase() === sSearchValue.toLowerCase() ||
								oItem.SADARAVENDOR_ID.toLowerCase() === sSearchValue2.toLowerCase()) {
								bExists = true; // Set flag if a match is found
							}
						});

						if (bExists) {
							MessageBox.error("Provider or Vendor ID already Exists", {
								icon: MessageBox.Icon.ERROR,
								title: "Information",
								actions: [MessageBox.Action.OK]
							});
						} else {

							var payload = {
								"SERVICEPROVIDER_ID": that.selectedItem.SERVICEPROVIDER_ID,
								"SERVICEPROVIDER_NAME": that.UpdateProvider.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getValue(),
								"SADARAVENDOR_ID": that.UpdateProvider.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getValue(),
								"CREATIONDATETIME": that.selectedItem.CREATIONDATETIME,
								"CREATEDBY": that.selectedItem.CREATEDBY,
								"UPDATEDATETIME": odataDate,
								"UPDATEDBY": sap.ushell.Container.getService("UserInfo").getFullName(),
								"DELETIONFLAG": that.UpdateProvider.getContent()[0].getFormContainers()[0].getFormElements()[3].getFields()[0].getState() ?
									"X" : "",
									"PROVIDER_CATEGORY": that.UpdateProvider.getContent()[0].getFormContainers()[0].getFormElements()[2].getFields()[0].getSelectedKey(),
							};
							that.UpdateProvider.close();
							oModel.update("/SERVICEPROVIDERMASTER(" + that.selectedItem.SERVICEPROVIDER_ID + ")", payload, {
								success: function (data, oResponse) {
									MessageBox.success("Provider Updated Successfully");
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