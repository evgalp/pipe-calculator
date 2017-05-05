

//constructors
function RollingMill(baseRollDiameter, sigmaHalf, alpha, n, carriageStrokeLength, L, carriageStrokeLengthRotational, reductionSectionLength, trunnionDiameter, DkDcMax, m){
	this.baseRollDiameter = baseRollDiameter;
	this.sigmaHalf = sigmaHalf;
	this.sigma = this.sigmaHalf * 2;
	this.alpha = serviceModule.toRadians(alpha);
	this.n = n;
	this.carriageStrokeLength = carriageStrokeLength;
	this.L = L;
	this.carriageStrokeLengthRotational = carriageStrokeLengthRotational;
	this.reductionSectionLength = reductionSectionLength;
	this.trunnionDiameter = trunnionDiameter;
	this.DkDcMax = DkDcMax;
	this.m = m;

	return this;
}

function Route(billetDiameterInitial, billetDiameterFinal, billetWallThicknessInitial, billetWallThicknessFinal){
	this.billetDiameterInitial = billetDiameterInitial;
	this.billetDiameterFinal = billetDiameterFinal;
	this.billetWallThicknessInitial = billetWallThicknessInitial;
	this.billetWallThicknessFinal = billetWallThicknessFinal;

	if(this.billetWallThicknessInitial < 1){
		this.sigmaT = 0.12;
	}
	if(this.billetWallThicknessInitial > 1){
		this.sigmaT = 0.10;
	}

	return this;
}

function Material(sigmaB1, sigmaB2){
	this.sigmaB1 = sigmaB1;
	this.sigmaB2 = sigmaB2;

	return this;
}


var serviceModule = (function(){

	function toRadians (angle) {
	  return angle * (Math.PI / 180);
	}

	return{
		toRadians: toRadians
	}

})();

var calcModule = (function(){
	function calcRollSize(mill, route){
		rollSize = {};
		rollSize.rebordDiameter = (mill.baseRollDiameter - mill.sigmaHalf) * Math.sin(mill.alpha);
		rollSize.bottomRollDiameter = mill.baseRollDiameter - route.billetDiameterFinal;
		rollSize.rebordMinimalThickness = 0.7 * (route.billetDiameterFinal / 2) * (1 - Math.cos(mill.alpha));
		rollSize.effectiveRollDiameter = rollSize.bottomRollDiameter + 0.2 * route.billetDiameterFinal;
		rollSize.alpha = serviceModule.toRadians(180 / mill.n);
		rollSize.beta = serviceModule.toRadians(15);

		return rollSize;
	}

	function calcGuidePlaneSize(mill, route){
		var guidePlane = {};
		guidePlane.workLength = (mill.carriageStrokeLength) / (1 + mill.DkDcMax);
		guidePlane.lb = mill.L - guidePlane.workLength;
		guidePlane.ln = mill.carriageStrokeLengthRotational / (1 + mill.DkDcMax);
		guidePlane.Yn = (route.billetDiameterInitial / 2) - (route.billetDiameterFinal / 2);
		guidePlane.Yp = (route.billetWallThicknessInitial) - (route.billetWallThicknessFinal);
		// TODO - check if slope =< 0.06; if false - ???
		guidePlane.slope = (guidePlane.Yn - guidePlane.Yp) / mill.reductionSectionLength;
		if(guidePlane.slope <= 0.06){
			guidePlane.slopeIsNormal = true;
		}else{
			guidePlane.slopeIsNormal = false;
		}
		guidePlane.elongation = ( (route.billetDiameterInitial - route.billetWallThicknessInitial) * route.billetWallThicknessInitial ) /( (route.billetDiameterFinal - route.billetWallThicknessFinal) * route.billetWallThicknessFinal );
		guidePlane.horizontalSection = mill.m * guidePlane.elongation / mill.DkDcMax;
		guidePlane.calibratingSection = (4 * guidePlane.elongation * mill.m) / (rollSize.effectiveRollDiameter / mill.trunnionDiameter);
		guidePlane.wallReductionSection = guidePlane.workLength - (guidePlane.ln + mill.reductionSectionLength + guidePlane.horizontalSection + guidePlane.calibratingSection); 

		return guidePlane;
	}

	function calcGuidePlaneProfile(mill, route){

		var guidePlane = calcModule.calcGuidePlaneSize(mill, route);
		var guidePlaneProfile = {};
		guidePlaneProfile.oneSectionLength = guidePlane.wallReductionSection / 7;
		guidePlaneProfile.tp = parseFloat(route.sigmaT) + parseFloat(route.billetWallThicknessInitial);
		guidePlaneProfile.ut = guidePlaneProfile.tp / route.billetWallThicknessFinal;
		var u = [];
		u[0] = (guidePlaneProfile.ut + 4.333) / 5.333;
		u[1] = (guidePlaneProfile.ut + 1.9091) / 2.9091;
		u[2] = (guidePlaneProfile.ut + 0.8824) / 1.8824;
		u[3] = (guidePlaneProfile.ut + 0.5238) / 1.5238;
		u[4] = (guidePlaneProfile.ut + 0.28) / 1.28;
		u[5] = (guidePlaneProfile.ut + 0.1236) / 1.1236;
		u[6] = guidePlaneProfile.ut;
		guidePlaneProfile.u = u;
		guidePlaneProfile.t = u.map(function(u){
			return guidePlaneProfile.tp / u;
		});
		guidePlaneProfile.yp = guidePlaneProfile.tp - route.billetWallThicknessFinal;
		guidePlaneProfile.yi = guidePlaneProfile.t.map(function(t){
			return t - route.billetWallThicknessFinal;
		});
		guidePlaneProfile.bp = (guidePlaneProfile.yp * mill.L) / (0.5 * guidePlane.lb + guidePlane.calibratingSection + guidePlane.horizontalSection + (7 - 0) * guidePlaneProfile.oneSectionLength);
		var n = [1, 2, 3, 4, 5, 6, 7];
		guidePlaneProfile.bi = guidePlaneProfile.yi.map(function(y, idx){
			return ( (y * mill.L) / (0.5 * guidePlane.lb + guidePlane.calibratingSection + guidePlane.horizontalSection + (7 - n[idx]) * guidePlaneProfile.oneSectionLength) );
		});
		rollSize.delta = (guidePlaneProfile.tp - guidePlaneProfile.t[0]) / Math.sin(rollSize.alpha);
		rollSize.gamma = Math.asin(rollSize.delta / route.billetDiameterFinal);
		rollSize.reductionRadius = (route.billetDiameterFinal / 2) * (1 + ( (4 * (Math.cos(rollSize.alpha + rollSize.gamma))**2 - 1 ) / (2 - 2 * Math.cos(rollSize.beta) * Math.cos(rollSize.alpha + rollSize.gamma)) ));
		return guidePlaneProfile;
	}

	function calcDeformation(mill, route, material){

		var guidePlaneProfile = calcModule.calcGuidePlaneProfile(mill, route);

		var deformation = {};

		deformation.wallReductionOne = guidePlaneProfile.tp - guidePlaneProfile.t[0];
		deformation.wallReductionTwo = guidePlaneProfile.t[0] - guidePlaneProfile.t[1];
		deformation.rogr = rollSize.bottomRollDiameter / 2;
		deformation.deltaOne = 0.35 * Math.sqrt(deformation.rogr / deformation.wallReductionOne);
		deformation.deltaTwo = 0.35 * Math.sqrt(deformation.rogr / deformation.wallReductionTwo);
		deformation.elongationOne = guidePlaneProfile.tp / guidePlaneProfile.t[0];
		deformation.elongationTwo = guidePlaneProfile.tp / guidePlaneProfile.t[1];
		deformation.epsilonOne = (1 - 1 / deformation.elongationOne) * 100;
		deformation.epsilonTwo = (1 - 1 / deformation.elongationTwo) * 100;
		deformation.k1 = 1.05 * material.sigmaB1;
		deformation.k2 = 1.05 * material.sigmaB2;
		deformation.forwardSlipZonePressureOne = (deformation.k1 / deformation.deltaOne) * ((deformation.deltaOne - 1) * ((guidePlaneProfile.tp / guidePlaneProfile.t[0])**deformation.delta) - 1);
		deformation.backwardSlipZonePressureOne = (deformation.k1 / deformation.deltaOne) * ((deformation.deltaOne - 1) * ((guidePlaneProfile.tp / guidePlaneProfile.t[0])**deformation.deltaOne) - 1);
		deformation.backwardSlipZonePressureTwo = (deformation.k2 / deformation.deltaTwo) * ((deformation.deltaTwo - 1) * ((guidePlaneProfile.t[0] / guidePlaneProfile.t[1])**deformation.deltaTwo) - 1);
		deformation.forwardSlipZonePressureOne = (deformation.k1 / deformation.deltaOne) * ((deformation.deltaOne + 1) * ((guidePlaneProfile.t[0] / guidePlaneProfile.t[1])**deformation.deltaOne) - 1);
		deformation.forwardSlipZonePressureTwo = (deformation.k2 / deformation.deltaTwo) * ((deformation.deltaTwo + 1) * ((guidePlaneProfile.t[1] / guidePlaneProfile.t[2])**deformation.deltaTwo) - 1);
		deformation.p1 = 0.5 * (deformation.backwardSlipZonePressureOne + deformation.forwardSlipZonePressureOne);
		deformation.p2 = 0.5 * (deformation.backwardSlipZonePressureTwo + deformation.forwardSlipZonePressureTwo);

		return deformation;
	}

	return{
		calcRollSize: calcRollSize,
		calcGuidePlaneSize: calcGuidePlaneSize,
		calcGuidePlaneProfile: calcGuidePlaneProfile,
		calcDeformation: calcDeformation
	}

})();

var cacheDomModule = (function(){

	var calcForm = $('#calcForm');

	function cacheMill(){
		var millSelect = calcForm.find('#millSelect');
		console.log(millSelect);
		var selctedMill = millSelect.text();
		console.log(selectedMill);
		if(selctedMill == 'mill_8_15'){
			var activeMill = new RollingMill(53.15, 0.5, 60, 3, 450, 150, 69, 12, 28.5, 1.4, 4.55);
		}
		if(selctedMill == 'mill_15_30'){
			var activeMill = new RollingMill(82, 0.5, 60, 3, 455, 210, 69, 12, 45, 1.6, 4.55);
		}
		return activeMill;
	}

	function cacheMillObj(e){
		var e = document.getElementById("millSelect");
		var selctedMill = e.options[e.selectedIndex].value;
		if(selctedMill == 'mill_8_15'){
			var activeMill = new RollingMill(53.15, 0.5, 60, 3, 450, 150, 69, 12, 28.5, 1.4, 4.55);
		}
		if(selctedMill == 'mill_15_30'){
			var activeMill = new RollingMill(82, 0.5, 60, 3, 455, 210, 69, 12, 45, 1.6, 4.55);
		}
		return activeMill;
	}

	function cacheMaterialObj(e){
		var e = document.getElementById("materialSelect");
		var selctedMaterial = e.options[e.selectedIndex].value;
		if(selctedMaterial == 'steel_20A'){
			var activeMaterial = new Material(660, 720);
		}
		return activeMaterial;
	}

	function cacheRouteObj(){
		var billetDiameterInitial = (document.getElementById("billetDiameterInitial").value).float();
		var billetDiameterFinal = (document.getElementById("billetDiameterFinal").value).float();
		var billetWallThicknessInitial = (document.getElementById("billetWallThicknessInitial").value).float();
		var billetWallThicknessFinal = (document.getElementById("billetWallThicknessFinal").value).float();
		var activeRoute = new Route (billetDiameterInitial, billetDiameterFinal, billetWallThicknessInitial, billetWallThicknessFinal);
		return activeRoute;
	}

	return{
		cacheMillObj: cacheMillObj,
		cacheMaterialObj: cacheMaterialObj,
		cacheRouteObj: cacheRouteObj,
		cacheMill: cacheMill
	}
})();


var renderModule = (function(){

	function addObjectToTable(table, obj, tr) {
	  var rows = 0;
	  for (key in obj) {
	    if (tr == null) {
	      tr = document.createElement('tr');
	      table.appendChild(tr);
	    }  
	  
	    var td = document.createElement('td');
	    td.textContent = key;
	    tr.appendChild(td);

	    var value = obj[key];
	    if (typeof value != 'object') {
	      var td = document.createElement('td');
	      td.textContent = value;
	      tr.appendChild(td);
	      rows += 1;
	    }
	    else {
	      var subrows = addObjectToTable(table, value, tr);
	      td.setAttribute('rowspan',subrows);
	      rows += subrows;
	    }
	    
	    tr = null;
	  }
	  return rows;
	}

	function addArraysToTable(tableData, tableId, counter) {
		var table = $('<table></table>');
		counter=(counter == undefined)?0:++counter;
		table.attr("id",tableId+counter);
		var tableBody = $('<tbody></tbody>');
		tableData.forEach(function(rowData) {
			var row = $('<tr></tr>');
			rowData.forEach(function(cellData) {
				var cell = $('<td></td>');
				if(Array.isArray(cellData)){
					cellData = addArraysToTable([cellData], tableId,counter);
					cell.append(cellData);
				}else{
					cellData=$('<div></div>').append($('<div class="data"></div>').append(cellData)).html();
					cell.append((cellData));
				}
				row.append(cell);
			});
			tableBody.append(row);
		});
		table.append(tableBody);
		$('body').append(table);
		transpose("#"+tableId+counter);
		return table;
	}

	function transpose(tableId){
	  $(tableId).each(function() {
	    var $this = $(this);
	    var newrows = [];
	    $(tableId+">tbody>tr").each(function(){
	      var i = 0;
	      $(this).find(">td").each(function(){
	          i++;
	          if(newrows[i] === undefined) { newrows[i] = $("<tr></tr>"); }
	          newrows[i].append($(this));
	      });
	    });
	    $(tableId+">tbody>tr").remove();
	    $.each(newrows, function(){
	        $this.append(this);
	    });
	  })
	  return false;
	}

	function clearTables(){
		if($("#domRollSizeTable0").length){
			$("#domRollSizeTable0").remove();
		}
		if($("#domGuidePlaneTable0").length){
			$("#domGuidePlaneTable0").remove();
		}
		if($("#domGuidePlaneProfileTable0").length){
			$("#domGuidePlaneProfileTable0").remove();
		}
		if($("#domDeformationTable0").length){
			$("#domDeformationTable0").remove();
		}
	}

	function clearByBtn(){
		var clearCalc = document.getElementById("clearCalc");

		clearCalc.addEventListener('click', clearTables());
	}

	function renderRollSizeTable(){
		var names = ["Діаметр реборд", "Діаметр дна ролика", "Мінімальна товщина реборд", "Діаметр, що катає", "\u03B1", "\u03B2", "\u03B4", "\u03B3", "Радіус випуску"];
		var values = Object.values(rollSize);
		var suffixes = ["мм", "мм", "мм", "мм", "--", "--", "--", "--", "мм"];

		addArraysToTable([names, values, suffixes], "domRollSizeTable");
	}

	function renderGuidePlaneTable(){
		var names = ["Робоча довжина", "Сумарна довжина ділянок виходу роликів із зіткнення з металом", "Ділянка подачі і повороту", "Зниження профілю планки в кінці ділянки подачі", "Зниження профілю планки в кінці ділянки редукції", "Ухил", "Ухил в межах норми", "Сумарна витяжка за прохід", "Горизонтальна ділянка", "Калібрувальна ділянка", "Ділянка редукції стінки"];
		var values = Object.values(guidePlane);
		var suffixes = ["мм", "мм", "мм", "мм", "мм", "--", "--", "мм", "мм", "мм", "мм"];

		addArraysToTable([names, values, suffixes], "domGuidePlaneTable");
	}

	function renderDeformationTable(){
		var names = ["Обтиснення стінки на ділянці 0-1", "Обтиснення стінки на ділянці 1-2", "\u03C1 гр", "\u03B4 1", "\u03B4 2", "Коефініент сумарної витяжки в перетині 1", "Коефініент сумарної витяжки в перетині 2", "Ступінь деформації в перетині 1", "Ступінь деформації в перетині 2", "Опір деформації в перетині 1", "Опір деформації в перетині 2", "Контактний тиск 1 для зони випередження", "Контактний тиск 2 для зони випередження", "Контактний тиск 1 для зони відставання", "Контактний тиск 2 для зони відставання", "Середній контактний тиск 1 в перетині двузонного осередку деформації", "Середній контактний тиск 2 в перетині двузонного осередку деформації"];
		var values = Object.values(deformation);
		var suffixes = ["мм", "мм","мм", "--", "--", "--", "--", "%", "%", "МПа", "МПа", "МПа", "МПа", "МПа", "МПа", "МПа", "МПа"];

		addArraysToTable([names, values, suffixes], "domDeformationTable");
	}

	function renderGuidePlaneProfileTable(){
		var names = ["Довжина однієї секції", "Товщина стінки на початку", "Коефіціент обтиснення стінки", "Коефініент обтиснення стінки в кожному перетині", "Товщина стінки в кожному перетині", "Зниження профілю планки на початку", "Зниження профілю планки в кожному перетині", "Виоста підкладок на початку", "Висота підкладок в кожному перетині"];
		var values = Object.values(guidePlaneProfile);
		
		var suffixes = ["мм","мм","мм","мм","мм","мм","мм","мм","мм"];

		addArraysToTable([names, values, suffixes], "domGuidePlaneProfileTable");
	}

	return{
		addObjectToTable: addObjectToTable,
		addArraysToTable: addArraysToTable,
		transpose: transpose,
		clearTables: clearTables,
		clearByBtn: clearByBtn,
		renderRollSizeTable: renderRollSizeTable,
		renderGuidePlaneTable: renderGuidePlaneTable,
		renderGuidePlaneProfileTable: renderGuidePlaneProfileTable,
		renderDeformationTable: renderDeformationTable
	}

})();



// other service functions

String.prototype.float = function() { 
  return parseFloat(this.replace(',', '.')); 
}


// main objects

// var millOne =  new RollingMill(82, 0.5, 60, 3, 455, 210, 69, 12, 45, 1.6, 4.55);

// var routeOne = new Route(17.5, 16.3, 0.7, 0.35);

// var materialOne = new Material(660, 720, 693, 756);

// functions



// DOM interactions

// rollSizeX = calcModule.calcRollSize(millOne, routeOne);
// guidePlaneX = calcModule.calcGuidePlaneSize(millOne, routeOne);
// guidePlaneProfileX = calcModule.calcGuidePlaneProfile(millOne, routeOne);
// deformationX = calcModule.calcDeformation(millOne, routeOne, materialOne);

// console.log(rollSizeX);
// console.log(guidePlaneX);
// console.log(guidePlaneProfileX);
// console.log(deformationX);








// (function mainCalc(){
// 	var makeCalc = document.getElementById("makeCalc");

// 	makeCalc.addEventListener('click', function(){
// 		var activeMill = createMillObj();
// 		var activeRoute = createRouteObj();
// 		var activeMaterial = createMaterialObj();


// 		var rollSize = calcRollSize(activeMill, activeRoute);
// 		var guidePlane = calcGuidePlaneSize(activeMill, activeRoute);
// 		var guidePlaneProfile = calcGuidePlaneProfile(activeMill, activeRoute);
// 		console.log(guidePlaneProfile);
// 		console.log(Object.values(guidePlaneProfile));
// 		var deformation = calcDeformation(activeMill, activeRoute, activeMaterial);

// 		clearTables();



// 		// (function fillTables(){
// 		// 	var domGuidePlaneProfileTable = document.createElement('table');
// 		// 	domGuidePlaneProfileTable.id = "domGuidePlaneProfileTable";
// 		// 	addObjectToTableArr(domGuidePlaneProfileTable, guidePlaneProfile);
// 		// 	document.body.appendChild(domGuidePlaneProfileTable);
// 		// })();



// 	})
// })();
		var millSelect = $('calcForm').find('#millSelect');
