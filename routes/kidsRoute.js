const express = require('express');
const router = express.Router();
const {ObjectId} = require('mongodb');
const { Kid } = require('../models/Kid');
const { Chart } = require('../models/Chart');


// =================== CREATE ========================

router.post('/', (req, res) => {
    const kid = new Kid({
        name: req.body.name,
        avatarIndex: req.body.avatarIndex,
        like: req.body.like
    });

    kid.save().then((createdKid => {
        res.status(201).json(createdKid)
    })).catch((err) => {
        res.status(400).json({
            error: err,
            success: false
        })
    })
})

// add a new chart for a specific kid
router.post("/:id", (req, res) => {
    // Create a new chart 
    const chart = new Chart({
        // timestamp: req.body.timestamp,
        antecedent: req.body.antecedent,
        behavior: req.body.behavior,
        consequence: req.body.consequence,
        function: req.body.function,
        kid_id: new ObjectId(req.params.id)
    });

    chart.save().then(createdChart => {
        res.status(201).json(createdChart)
    }).catch((err) => {
        res.json(err);
    });
});

// =================== READ ========================

router.get('/', async (req, res) => {
    const kidList = await Kid.find({}, '-__v');

    if (!kidList) {
        res.status(404).json({
            success: false
        })
    }

    res.send(kidList);
})

router.get('/:id', async (req, res) => {
    const kid = await Kid.findById(req.params.id, '-__v').populate({ path: 'chartsRecorded', select: 'antecedent behavior consequence function' });

    if (!kid) {
        res.status(404).json({ success: false, message: "Kid not found!" })
    }

    res.status(200).send(kid)
})

// =================== UPDATE ========================

router.put('/:id', async (req, res) => {
    Kid.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        avatar: req.body.avatar,
        like: req.body.like

    }, { new: true }).then(kid => {
        if (kid) {
            return res.status(200).send(kid)
        } else { return res.status(404).json({ success: false, message: "Kid not found!" }) }
    }).catch(err => (err => {
        return res.status(400).json({ success: false, error: err })
    }))
})

//  =================== DELETE ========================

router.delete('/:id', (req, res) => {
    Kid.findByIdAndRemove(req.params.id).then(kid => {
        if (kid) {
            return res.status(200).json({ success: true, message: "The kid has been successfully deleted!" })
        } else { return res.status(404).json({ success: false, message: "Kid not found!" }) }
    }).catch(err => (err => {
        return res.status(400).json({ success: false, error: err })
    }))
})

module.exports = router;