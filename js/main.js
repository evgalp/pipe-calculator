

var rollSize = {};
var guidePlane = {};

// RollingMill - mill constructor function

function RollingMill(baseRollDiameter, sigmaHalf, alpha, n, carriageStrokeLength,diametersMaxRelation, L, carriageStrokeLengthRotational, reductionSectionLength, trunnionDiameter, DkDcMax){

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

var millOne =  new RollingMill(82, 0.5, 60, 3, 455, 1.6, 210, 69, 12, 45, 1.6);

// declare variables - route

var routeOne = new Route(17.5, 16.3, 0.7, 0.35);

// calc functions

function calcRollSize(mill, route){

	rollSize.rebordDiameter = (mill.baseRollDiameter - mill.sigmaHalf) * Math.sin(mill.alpha);

	rollSize.bottomRollDiameter = mill.baseRollDiameter - route.billetDiameterFinal;

	rollSize.rebordMinimalThickness = 0.7 * (route.billetDiameterFinal / 2) * (1 - Math.cos(mill.alpha));

}

function calcGuidePlaneSize(mill, route){

	guidePlane.effectiveRollDiameter = rollSize.bottomRollDiameter + 0.2 * route.billetDiameterFinal;

	guidePlane.guidePlaneWorkLength = (mill.carriageStrokeLength) / (1 + mill.DkDcMax);

	guidePlane.lb = mill.L - guidePlane.guidePlaneWorkLength;
	
	guidePlane.ln = mill.carriageStrokeLengthRotational / (1 + mill.DkDcMax)
	
}

// console.log(calcRollSize(millOne, routeOne));
calcRollSize(millOne, routeOne);
calcGuidePlaneSize(millOne, routeOne);

console.log(millOne);

console.log(rollSize);

console.log(guidePlane);


// calcRollSize(millTwo, routeOne);
// calcGuidePlaneSize(millTwo, routeOne);

// console.log(globalResult);




