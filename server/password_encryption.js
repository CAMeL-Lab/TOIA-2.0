const bcrypt = require("bcrypt");
const saltRounds = 10;

// hashing the password
module.exports.hash = async pwd => {
	const salt = await bcrypt.genSalt(saltRounds);
	const hashedPwd = await bcrypt.hash(
		pw,
		salt,
		(err, hash) => {
			if (err) {
				reject(err);
				throw err;
			}
			return hash;
		},
	);
	return hashedPwd;
};

// logging in with bcrypt

module.exports.pwdCheck = async (plainPwd, hashedPwd) => {
	const result = await bcrypt.compare(
		plainPwd,
		hashedPwd,
	);
	return result;
};

//module.exports = {hash, pwdCheck};
