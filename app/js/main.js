

var rollSize = {};
var guidePlane = {};

// RollingMill - mill constructor function

function RollingMill(baseRollDiameter, sigmaHalf, alpha, n, carriageStrokeLength, diametersMaxRelation, L, carriageStrokeLengthRotational, reductionSectionLength, trunnionDiameter, DkDcMax, m){

	this.baseRollDiameter = baseRollDiameter;
	this.sigmaHalf = sigmaHalf;
	this.sigma = this.sigmaHalf * 2;
	this.alpha = toRadians(alpha);
	this.n = n;
	this.carriageStrokeLength = carriageStrokeLength;
	this.diametersMaxRelation = diametersMaxRelation;
	this.L = L;
	this.carriageStrokeLengthRotational = carriageStrokeLengthRotational;
	this.reductionSectionLength = reductionSectionLength;
	this.trunnionDiameter = trunnionDiameter;
	this.DkDcMax = DkDcMax;
	this.m = m;

	return this;
}

// Route - route constructor function

function Route(billetDiameterInitial, billetDiameterFinal, billetWallThicknessInitial, billetWallThicknessFinal){

	this.billetDiameterInitial = billetDiameterInitial;
	this.billetDiameterFinal = billetDiameterFinal;
	this.billetWallThicknessInitial = billetWallThicknessInitial;
	this.billetWallThicknessFinal = billetWallThicknessFinal;

	return this;
}

// other service functions

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

// declare variables - mills

var millOne =  new RollingMill(82, 0.5, 60, 3, 455, 1.6, 210, 69, 12, 45, 1.6, 4.55);

// declare variables - route

var routeOne = new Route(17.5, 16.3, 0.7, 0.35);

// calc functions

function calcRollSize(mill, route){

	rollSize.rebordDiameter = (mill.baseRollDiameter - mill.sigmaHalf) * Math.sin(mill.alpha);

	rollSize.bottomRollDiameter = mill.baseRollDiameter - route.billetDiameterFinal;

	rollSize.rebordMinimalThickness = 0.7 * (route.billetDiameterFinal / 2) * (1 - Math.cos(mill.alpha));

	rollSize.effectiveRollDiameter = rollSize.bottomRollDiameter + 0.2 * route.billetDiameterFinal;

}

function calcGuidePlaneSize(mill, route){

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
}

// console.log(calcRollSize(millOne, routeOne));
calcRollSize(millOne, routeOne);
calcGuidePlaneSize(millOne, routeOne);

// console.log(millOne);
// console.log(rollSize);
// console.log(guidePlane);

console.table([millOne]);
console.table([rollSize]);
console.table([guidePlane]);





