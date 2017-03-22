// globalResult - obj to write all values calculated in functions

var globalResult = {

}

// RollingMill - mill constructor function

function RollingMill(baseRollDiameter, sigmaHalf, alpha, n, carriageStrokeLength,diametersMaxRelation, L, carriageStrokeLengthRotational, reductionSectionLength, trunnionDiameter){

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

var millOne =  new RollingMill(82, 0.5, 60, 3, 455, 1.6, 210, 69, 12, 45);

// declare variables - route

var routeOne = new Route(17.5, 16.3, 0.7, 0.35);

// calc functions

function calcRollSize(mill, route){

	globalResult.rebordDiameter = (mill.baseRollDiameter - mill.sigmaHalf) * Math.sin(mill.alpha);

	globalResult.bottomRollDiameter = mill.baseRollDiameter - route.billetDiameterFinal;

	globalResult.rebordMinimalThickness = 0.7 * (route.billetDiameterFinal / 2) * (1 - Math.cos(mill.alpha));

}

function calcGuidePlaneSize(mill, route){

	globalResult.effectiveRollDiameter = globalResult.bottomRollDiameter - route.billetDiameterFinal;
	
	
}

// console.log(calcRollSize(millOne, routeOne));
calcRollSize(millOne, routeOne);
calcGuidePlaneSize(millOne, routeOne);

console.log(millOne);

console.log(globalResult);

// calcRollSize(millTwo, routeOne);
// calcGuidePlaneSize(millTwo, routeOne);

// console.log(globalResult);




