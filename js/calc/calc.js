String.prototype.float = function() { 
  return parseFloat(this.replace(',', '.')); 
}

//constructors
function RollingMill(baseRollDiameter, sigmaHalf, alpha, n, carriageStrokeLength, L, carriageStrokeLengthRotational, reductionSectionLength, trunnionDiameter, DkDcMax, m, mx, reductionZoneLength, frequency, mMax){
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
	this.mx = mx;
	this.reductionZoneLength = reductionZoneLength;
	this.frequency = frequency;
	this.mMax = mMax;
	return this;
}

function Route(billetDiameterInitial, billetDiameterFinal, billetWallThicknessInitial, billetWallThicknessFinal, billetLengthInitial, pauseTime){
	this.billetDiameterInitial = billetDiameterInitial;
	this.billetDiameterFinal = billetDiameterFinal;
	this.billetWallThicknessInitial = billetWallThicknessInitial;
	this.billetWallThicknessFinal = billetWallThicknessFinal;
	this.billetLengthInitial = billetLengthInitial;
	if(this.billetWallThicknessInitial <= 1){
		this.sigmaT = 0.12;
	}
	if(this.billetWallThicknessInitial > 1){
		this.sigmaT = 0.10;
	}
	this.pauseTime = pauseTime;
	return this;
}

function Material(sigmaB1, sigmaB2){
	this.sigmaB1 = sigmaB1;
	this.sigmaB2 = sigmaB2;

	return this;
}

// modules

var serviceModule = (function(){

	function isNumber(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function toRadians (angle) {
	  return angle * (Math.PI / 180);
	}

	function roundNumericArrayValues(array, precision){
		var roundedArray = [];
		array.forEach(function round(elem){
			if(isNumber(elem)) {
				roundedArray.push(elem.toFixed(precision));
			} else if(elem.constructor === Array){
				roundedArray.push(roundNumericArrayValues(elem, precision));
			} else {
				roundedArray.push(elem);
			}
		})
		return roundedArray;
	}

	return{
		isNumber: isNumber,
		toRadians: toRadians,
		roundNumericArrayValues: roundNumericArrayValues
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

		// horrible hack to handle negative values
		var lb = mill.L - guidePlane.workLength;
		if (lb >= 0) {
			guidePlane.lb = lb;
		} else {
			guidePlane.lb = -lb;
		}

		guidePlane.ln = mill.carriageStrokeLengthRotational / (1 + mill.DkDcMax);
		guidePlane.Yn = (route.billetDiameterInitial / 2) - (route.billetDiameterFinal / 2);
		guidePlane.Yp = (route.billetWallThicknessInitial) - (route.billetWallThicknessFinal);
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
		rollSize.reductionRadius = (route.billetDiameterFinal / 2) * (1 + ( (4 * Math.pow((Math.cos(rollSize.alpha + rollSize.gamma)), 2) - 1 ) / (2 - 2 * Math.cos(rollSize.beta) * Math.cos(rollSize.alpha + rollSize.gamma)) ));
		return guidePlaneProfile;
	}

	function calcDeformation(mill, route, material){

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
		deformation.forwardSlipZonePressureOne = (deformation.k1 / deformation.deltaOne) * ((deformation.deltaOne - 1) * Math.pow((guidePlaneProfile.tp / guidePlaneProfile.t[0]), deformation.delta) - 1);
		deformation.backwardSlipZonePressureOne = (deformation.k1 / deformation.deltaOne) * ((deformation.deltaOne - 1) * Math.pow((guidePlaneProfile.tp / guidePlaneProfile.t[0]), deformation.deltaOne) - 1);
		deformation.backwardSlipZonePressureTwo = (deformation.k2 / deformation.deltaTwo) * ((deformation.deltaTwo - 1) * Math.pow((guidePlaneProfile.t[0] / guidePlaneProfile.t[1]), deformation.deltaTwo) - 1);
		deformation.forwardSlipZonePressureOne = (deformation.k1 / deformation.deltaOne) * ((deformation.deltaOne + 1) * Math.pow((guidePlaneProfile.t[0] / guidePlaneProfile.t[1]), deformation.deltaOne) - 1);
		deformation.forwardSlipZonePressureTwo = (deformation.k2 / deformation.deltaTwo) * ((deformation.deltaTwo + 1) * Math.pow((guidePlaneProfile.t[1] / guidePlaneProfile.t[2]), deformation.deltaTwo) - 1);
		deformation.p1 = 0.5 * (deformation.backwardSlipZonePressureOne + deformation.forwardSlipZonePressureOne);
		deformation.p2 = 0.5 * (deformation.backwardSlipZonePressureTwo + deformation.forwardSlipZonePressureTwo);

		return deformation;
	}

	function calcProductivity(mill, route){
		var productivity = {};

		productivity.elongationRatio = ( (route.billetDiameterInitial - route.billetWallThicknessInitial) * route.billetWallThicknessInitial ) / ( (route.billetDiameterFinal - route.billetWallThicknessFinal) * route.billetWallThicknessFinal );
		productivity.linearShift = mill.reductionZoneLength * ( productivity.elongationRatio / (productivity.elongationRatio - 1) ) * Math.log(mill.mx);
		productivity.hourProductivity = 60 / ( (1000 / (productivity.linearShift * mill.frequency)) + (route.pauseTime / (60 * productivity.elongationRatio * mill.reductionZoneLength)) )

		return productivity;
	}

	return{
		calcRollSize: calcRollSize,
		calcGuidePlaneSize: calcGuidePlaneSize,
		calcGuidePlaneProfile: calcGuidePlaneProfile,
		calcDeformation: calcDeformation, 
		calcProductivity: calcProductivity
	}

})();

var cacheDomModule = (function(){

	var calcForm = $('#calcForm');

	function cacheMill(){
		var selectedMill = calcForm.find('.millSelect').val();
		if(selectedMill == 'mill_8_15'){
			var activeMill = new RollingMill(53.15, 0.5, 60, 3, 450, 150, 69, 12, 28.5, 1.4, 4.55, 1.055, 170, 110, 9);
		}
		if(selectedMill == 'mill_15_30'){
			var activeMill = new RollingMill(82, 0.5, 60, 3, 455, 210, 69, 12, 45, 1.6, 4.55, 1.055, 170, 90, 12);
		}
		if(selectedMill == 'mill_30_60'){
			var activeMill = new RollingMill(131, 0.8, 60, 3, 607, 207, 69, 12, 65, 1.5, 4.55, 1.035, 170, 90, 12);
		}
		if(selectedMill == 'mill_60_120'){
			var activeMill = new RollingMill(240, 1.2, 45, 4, 755, 320, 69, 12, 100, 1.6, 4.55, 1.020, 170, 70, 12);
		}
		return activeMill;
	}

	function cacheMaterial(){
		var selectedMaterial = calcForm.find('.materialSelect').val();
		if(selectedMaterial == 'steel_20A'){
			var activeMaterial = new Material(660, 720);
		}
		if(selectedMaterial == 'steel_10G2'){
			var activeMaterial = new Material(250, 433);
		}
		if(selectedMaterial == 'steel_09G2C'){
			var activeMaterial = new Material(350, 448);
		}
		if(selectedMaterial == 'steel_20X'){
			var activeMaterial = new Material(300, 467);
		}
		if(selectedMaterial == 'steel_40X'){
			var activeMaterial = new Material(330, 507);
		}
		if(selectedMaterial == 'steel_35XM'){
			var activeMaterial = new Material(850, 654);
		}
		if(selectedMaterial == 'steel_40XH'){
			var activeMaterial = new Material(460, 565);
		}
		if(selectedMaterial == 'steel_30XGC'){
			var activeMaterial = new Material(360, 497);
		}
		if(selectedMaterial == 'steel_60C2'){
			var activeMaterial = new Material(1200, 771);
		}
		if(selectedMaterial == 'steel_SH15'){
			var activeMaterial = new Material(380, 497);
		}

		return activeMaterial;
	}

	function cacheRoute(){
		var billetDiameterInitial = (calcForm.find('.billetDiameterInitial').val()).float();
		var billetDiameterFinal = (calcForm.find('.billetDiameterFinal').val()).float();
		var billetWallThicknessInitial = (calcForm.find('.billetWallThicknessInitial').val()).float();
		var billetWallThicknessFinal = (calcForm.find('.billetWallThicknessFinal').val()).float();
		if( (calcForm.find('.billetLengthInitial')).length ){
			var billetLengthInitial = (calcForm.find('.billetLengthInitial').val()).float();
		}
		if( (calcForm.find('.pauseTime')).length ){
			var pauseTime = (calcForm.find('.pauseTime').val()).float();
		}
		var activeRoute = new Route (billetDiameterInitial, billetDiameterFinal, billetWallThicknessInitial, billetWallThicknessFinal, billetLengthInitial, pauseTime);
		return activeRoute;
	}

	return{
		cacheMill: cacheMill,
		cacheMaterial: cacheMaterial,
		cacheRoute: cacheRoute
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
		table.attr("class", "uk-align-center uk-table uk-table-striped uk-table-hover uk-table-divider");
		var tableBody = $('<tbody></tbody>');
		tableData.forEach(function(rowData) {
			var row = $('<tr></tr>');
			rowData.forEach(function(cellData) {
				var cell = $('<td></td>');
				if(Array.isArray(cellData)){
					cellData = addArraysToTable([cellData], tableId,counter);
					cellData.attr("class", "")
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
		$('#calc-result').append(table);
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
		if($("#domProductivityTable0").length){
			$("#domProductivityTable0").remove();
		}
	}

	function clearByBtn(){
		var clearCalc = document.getElementById("clearCalc");

		clearCalc.addEventListener('click', clearTables());
	}

	function renderRollSizeTable(){
		var names = ["Діаметр реборд", "Діаметр дна ролика", "Мінімальна товщина реборд", "Діаметр, що катає", "\u03B1", "\u03B2", "\u03B4", "\u03B3", "Радіус випуску"];
		var values = serviceModule.roundNumericArrayValues(Object.values(rollSize), 2);
		var suffixes = ["мм", "мм", "мм", "мм", "--", "--", "--", "--", "мм"];
		addArraysToTable([names, values, suffixes], "domRollSizeTable");
	}

	function renderGuidePlaneTable(){
		var names = ["Робоча довжина", "Сумарна довжина ділянок виходу роликів із зіткнення з металом", "Ділянка подачі і повороту", "Зниження профілю планки в кінці ділянки подачі", "Зниження профілю планки в кінці ділянки редукції", "Ухил", "Ухил в межах норми", "Сумарна витяжка за прохід", "Горизонтальна ділянка", "Калібрувальна ділянка", "Ділянка редукції стінки"];
		var values = serviceModule.roundNumericArrayValues(Object.values(guidePlane), 2);
		var suffixes = ["мм", "мм", "мм", "мм", "мм", "--", "--", "мм", "мм", "мм", "мм"];
		addArraysToTable([names, values, suffixes], "domGuidePlaneTable");
	}

	function renderDeformationTable(){
		var names = ["Обтиснення стінки на ділянці 0-1", "Обтиснення стінки на ділянці 1-2", "\u03C1 гр", "\u03B4 1", "\u03B4 2", "Коефіцієнт сумарної витяжки в перетині 1", "Коефіцієнт сумарної витяжки в перетині 2", "Ступінь деформації в перетині 1", "Ступінь деформації в перетині 2", "Опір деформації в перетині 1", "Опір деформації в перетині 2", "Контактний тиск 1 для зони випередження", "Контактний тиск 2 для зони випередження", "Контактний тиск 1 для зони відставання", "Контактний тиск 2 для зони відставання", "Середній контактний тиск 1 в перетині двузонного осередку деформації", "Середній контактний тиск 2 в перетині двузонного осередку деформації"];
		var values = serviceModule.roundNumericArrayValues(Object.values(deformation), 2);
		var suffixes = ["мм", "мм","мм", "--", "--", "--", "--", "%", "%", "МПа", "МПа", "МПа", "МПа", "МПа", "МПа", "МПа", "МПа"];
		addArraysToTable([names, values, suffixes], "domDeformationTable");
	}

	function renderGuidePlaneProfileTable(){
		var names = ["Довжина однієї секції", "Товщина стінки на початку", "Коефіцієнт обтиснення стінки", "Коефіцієнт обтиснення стінки в кожному перетині", "Товщина стінки в кожному перетині", "Зниження профілю планки на початку", "Зниження профілю планки в кожному перетині", "Виоста підкладок на початку", "Висота підкладок в кожному перетині"];
		var values = serviceModule.roundNumericArrayValues(Object.values(guidePlaneProfile), 2);
		var suffixes = ["мм","мм","мм","мм","мм","мм","мм","мм","мм"];
		addArraysToTable([names, values, suffixes], "domGuidePlaneProfileTable");
	}

	function renderProductivityTable(){
		var names = ["Коефіцієнт витяжки", "Лінійне зміщення", "Годинна продуктивність"];
		var values = serviceModule.roundNumericArrayValues(Object.values(productivity));
		var suffixes = ["--", "мм", "м/год"];
		addArraysToTable([names, values, suffixes], "domProductivityTable");
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
		renderDeformationTable: renderDeformationTable,
		renderProductivityTable: renderProductivityTable
	}

})();

// handlers

var eventHandler = (function(){

	$(document).on('click', '#calcInstrument', calcInstrumentHandler);

	function calcInstrumentHandler(){
		var mill = cacheDomModule.cacheMill();
		var route = cacheDomModule.cacheRoute();
		rollSize = calcModule.calcRollSize(mill, route);
		guidePlane = calcModule.calcGuidePlaneSize(mill, route);
		guidePlaneProfile = calcModule.calcGuidePlaneProfile(mill, route);
		renderModule.clearTables();
		renderModule.renderRollSizeTable();
		renderModule.renderGuidePlaneTable();
		renderModule.renderGuidePlaneProfileTable();
	}

	$(document).on('click', '#calcDeformation', calcDeformationHandler);

	function calcDeformationHandler(){
		var mill = cacheDomModule.cacheMill();
		var route = cacheDomModule.cacheRoute();
		var material = cacheDomModule.cacheMaterial();
		rollSize = calcModule.calcRollSize(mill, route);
		guidePlane = calcModule.calcGuidePlaneSize(mill, route);
		guidePlaneProfile = calcModule.calcGuidePlaneProfile(mill, route);
		deformation = calcModule.calcDeformation(mill, route, material);
		renderModule.clearTables();
		renderModule.renderDeformationTable();
	}

	$(document).on('click', '#calcProductivity', calcProductivityHandler);

	function calcProductivityHandler(){
		var mill = cacheDomModule.cacheMill();
		var route = cacheDomModule.cacheRoute();
		var material = cacheDomModule.cacheMaterial();
		productivity = calcModule.calcProductivity(mill, route);
		renderModule.clearTables();
		renderModule.renderProductivityTable();
	}

	$(document).on('click', '#clearCalc', clearHandler);

	function clearHandler(){
		renderModule.clearTables();
	}

})();
