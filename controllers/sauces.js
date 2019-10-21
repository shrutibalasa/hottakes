const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
	const url = req.protocol + '://' + req.get('host');
	req.body.sauce = JSON.parse(req.body.sauce);
	const usersLikedArray = new Array();
	const usersDislikedArray = new Array();
	const sauce = new Sauce({
		userId: req.body.sauce.userId,
		name: req.body.sauce.name,
		manufacturer: req.body.sauce.manufacturer,
		description: req.body.sauce.description,
		mainPepper: req.body.sauce.mainPepper,
		imageUrl: url + '/images/' +req.file.filename,
		heat: req.body.sauce.heat,
		likes: 0,
		dislikes: 0,
		usersLiked: usersLikedArray,
		usersDisliked: usersDislikedArray
	});
	sauce.save().then(
		() => {
			res.status(201).json({
				message: 'Data saved successfuly'
			});
		}
	).catch(
		(error) => {
			console.log("Error while saving to database");
			res.status(400).json({
				error: error
			})
		}
	);
};

exports.getAllSauces = (req, res, next) => {
	Sauce.find().then(
		(sauces) => {
			res.status(200).json(sauces);
		}
	).catch(
		(error) => {
			res.status(400).json({
				error: error
			});
		}
	);
};

exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({
		_id: req.params.id
	}).then(
		(sauce) => {
			res.status(200).json(sauce);
		}
	).catch(
		(error) => {
			res.status(404).json({
				error: error
			})
		}
	)
};

exports.likeSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id }).then(
		(sauce) => {
			if(req.body.like == 1) {
				if(!sauce.usersLiked.includes(req.body.userId)) {
					sauce.usersLiked.push(req.body.userId);
					sauce.likes++;
				}
			} else if(req.body.like == 0) {
				const usersLikedIndex = sauce.usersLiked.indexOf(req.body.userId);
				const usersDislikedIndex = sauce.usersDisliked.indexOf(req.body.userId);
				if (usersLikedIndex > -1) {
					sauce.usersLiked.splice(usersLikedIndex, 1);
					sauce.likes--;
				}
				if (usersDislikedIndex > -1) {
					sauce.usersDisliked.splice(usersDislikedIndex, 1);
					sauce.dislikes--;
				}
				console.log(sauce);
			} else if(req.body.like == -1) {
				if(!sauce.usersDisliked.includes(req.body.userId)) {
					sauce.usersDisliked.push(req.body.userId);
					sauce.dislikes++;
				}
			}
			Sauce.updateOne({_id: req.params.id}, sauce).then(
				() => {
					res.status(201).json({
						message: "Likes / Dislikes updated successfuly"
					});
				}
			).catch(
				(error) => {
					res.status(400).json({
						error: error
					})
				}
			);
		}
	).catch(
		(error) => {
			res.status(400).json({
				error: error
			});
		}
	);
};

exports.modifySauce = (req, res, next) => {
	let sauce = new Sauce({ _id: req.params.id });
	if(req.file) {
		const url = req.protocol + '://' + req.get('host');
		req.body.sauce = JSON.parse(req.body.sauce);
		sauce = Sauce({
			_id: req.params.id,
			userId: req.body.sauce.userId,
			name: req.body.sauce.name,
			manufacturer: req.body.sauce.manufacturer,
			description: req.body.sauce.description,
			mainPepper: req.body.sauce.mainPepper,
			imageUrl: url + '/images/' +req.file.filename,
			heat: req.body.sauce.heat
		});
	} else {
		sauce = Sauce({
			_id: req.params.id,
			userId: req.body.userId,
			name: req.body.name,
			manufacturer: req.body.manufacturer,
			description: req.body.description,
			mainPepper: req.body.mainPepper,
			imageUrl: req.body.imageUrl,
			heat: req.body.heat
		});
	}
	Sauce.updateOne({_id: req.params.id}, sauce).then(
		() => {
			res.status(201).json({
				message: 'Updated Successfully'
			});
		}
	).catch(
		(error) => {
			res.status(400).json({
				error: error
			})
		}
	);
};

exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id }).then(
		(sauce) => {
			const filename = sauce.imageUrl.split('/images/')[1];
			fs.unlink('images/' + filename, () => {
				Sauce.deleteOne({_id: req.params.id}).then(
					() => {
						res.status(200).json({
							message: 'Sauce deleted successfully'
						});
					}
				).catch(
					(error) => {
						res.status(400).json({
							error: error
						})
					}
				);
			});
		}
	);
};


