
// constants obj - variables common to any mill type
let costants = {

}

// roollingMill - mill constructor function

function RollingMill(n, m){

	this.n = n;
	this.m = m;
	this.nSquare = this.n * this.n;

	return this;
}

let mill15_30 = new RollingMill(15, 20);