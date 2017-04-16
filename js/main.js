var rollSize = {};
var guidePlane = {};
var guidePlaneProfile = {};
var deformation = {};

//constructors

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

function Route(billetDiameterInitial, billetDiameterFinal, billetWallThicknessInitial, billetWallThicknessFinal){

	this.billetDiameterInitial = billetDiameterInitial;
	this.billetDiameterFinal = billetDiameterFinal;
	this.billetWallThicknessInitial = billetWallThicknessInitial;
	this.billetWallThicknessFinal = billetWallThicknessFinal;

	return this;
}

function Material(sigmaB1, sigmaB2){
	this.sigmaB1 = sigmaB1;
	this.sigmaB2 = sigmaB2;

	return this;
}

// other service functions

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function precisionLimits(route){
	if(route.billetWallThicknessInitial < 1){
		sigmaT = 0.12;
	}
	if(route.billetWallThicknessInitial > 1){
		sigmaT = 0.10;
	}
	return sigmaT;
}

// main objects

var millOne =  new RollingMill(82, 0.5, 60, 3, 455, 1.6, 210, 69, 12, 45, 1.6, 4.55);

var routeOne = new Route(17.5, 16.3, 0.7, 0.35);

var materialOne = new Material(660, 720, 693, 756);

// functions

function calcRollSize(mill, route){

	rollSize.rebordDiameter = (mill.baseRollDiameter - mill.sigmaHalf) * Math.sin(mill.alpha);

	rollSize.bottomRollDiameter = mill.baseRollDiameter - route.billetDiameterFinal;

	rollSize.rebordMinimalThickness = 0.7 * (route.billetDiameterFinal / 2) * (1 - Math.cos(mill.alpha));

	rollSize.effectiveRollDiameter = rollSize.bottomRollDiameter + 0.2 * route.billetDiameterFinal;

	rollSize.alpha = toRadians(180 / mill.n);

	rollSize.beta = toRadians(15);

	rollSize.delta = (guidePlaneProfile.tp - guidePlaneProfile.t[0]) / Math.sin(rollSize.alpha);

	rollSize.gamma = Math.asin(rollSize.delta / route.billetDiameterFinal);

	rollSize.reductionRadius = (route.billetDiameterFinal / 2) * (1 + ( (4 * (Math.cos(rollSize.alpha + rollSize.gamma))**2 - 1 ) / (2 - 2 * Math.cos(rollSize.beta) * Math.cos(rollSize.alpha + rollSize.gamma)) ));

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

function calcGuidePlaneProfile(mill, route){
	guidePlaneProfile.oneSectionLength = guidePlane.wallReductionSection / 7;
	guidePlaneProfile.tp = precisionLimits(route) + route.billetWallThicknessInitial;
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

	guidePlaneProfile.yi = guidePlaneProfile.t.map(function(t){
		return t - route.billetWallThicknessFinal;
	});

	guidePlaneProfile.yp = guidePlaneProfile.tp - route.billetWallThicknessFinal;

	guidePlaneProfile.bp = (guidePlaneProfile.yp * mill.L) / (0.5 * guidePlane.lb + guidePlane.calibratingSection + guidePlane.horizontalSection + (7 - 0) * guidePlaneProfile.oneSectionLength);

	var n = [1, 2, 3, 4, 5, 6, 7];

	guidePlaneProfile.bi = guidePlaneProfile.yi.map(function(y, idx){
		return ( (y * mill.L) / (0.5 * guidePlane.lb + guidePlane.calibratingSection + guidePlane.horizontalSection + (7 - n[idx]) * guidePlaneProfile.oneSectionLength) );
	});

	// rob - in rollSize

}

function calcDeformation(mill, route, material){
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
}



calcGuidePlaneSize(millOne, routeOne);
calcGuidePlaneProfile(millOne, routeOne);
calcRollSize(millOne, routeOne);
calcDeformation(millOne, routeOne, materialOne);

// console.log(millOne);
// console.log(rollSize);
// console.log(guidePlane);
// console.log(guidePlaneProfile);
console.log(deformation);

// console.table([millOne]);
// console.table([rollSize]);
// console.table([guidePlane]);
// console.table([guidePlaneProfile]);




