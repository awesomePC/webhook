const PayStatus = require("./PayStatus");
const GameLog = require("./GameLog");

const update = async (req, res) => {

    try{
        //receive data from webhook whenever users pay.
        let data = req.body.payload.payment.entity;
        
        //extract neccessary data from webhook and save those according to qr_code
        const newPayStatus = new PayStatus();
        newPayStatus.qr_code = req.body.payload.qr_code.entity.id;
        newPayStatus.status = data.captured;
        let timestamp = Math.floor(Date.now() /1000);
        newPayStatus.timestamp =  timestamp;
        // newPayStatus.timestamp =  data.created_at;
        
        await newPayStatus.save();
        console.log(newPayStatus);
        //send success 
        res.status(200).send('success');
    }
    catch(err){
        console.log(err);
        res.status(403).send(err);
    }

}
const check = async (req, res) => {

    // console.log(req.query.qr_code)
    //get qr_code from local machine
    let qr_code = req.query.qr_code;
    let timestamp = Math.floor(Date.now() /1000);
    
    all_data = await PayStatus.find({ qr_code: qr_code });
    all_data.forEach(element => {
        if(timestamp - element.timestamp >  40)
        {
            element.remove()
        }
        
    });
    // PayStatus.deleteMany( { title: "Titanic" } )
    // console.log(timestamp);
    //get updated paymend data according to qr_code and send state
    data = await PayStatus.find({ qr_code: qr_code }).sort({timestamp:-1}).limit(1);
    // console.log(data[0].timestamp);
    if((data.length>0)&&(timestamp-data[0].timestamp > 40 ))
    {   
        data[0].status = false;
    }
    // data = await PayStatus.find({ qr_code: qr_code });
    // filter({ qr_code: qr_code });
    res.status(200).send(data);
}

const gamelog = async(req, res) => {

    try {
        console.log(req.body)
        let is_new = req.body.is_new;
        let qr_code = req.body.qr_code;
        let date = new Date()
        date.setHours(0, 0, 0, 0);
        // let userInput = '09:20';
        let userInput = req.body.start_time;
        let hours = userInput.slice(0, 2);
        let minutes = userInput.slice(3, 5);
        let seconds = userInput.slice(6, 8);
        let start_date = new Date();
        start_date.setHours(hours, minutes, seconds, 0);

        //restart
        let re_userInput = req.body.restart_time;
        let re_hours = re_userInput.slice(0, 2);
        let re_minutes = re_userInput.slice(3, 5);
        let re_seconds = re_userInput.slice(6, 8);
        let re_start_date = new Date();
        re_start_date.setHours(re_hours, re_minutes, re_seconds, 0);

        if(is_new == 'true') {
            console.log(is_new)
            const gamelog = new GameLog();
            gamelog.qr_code = req.body.qr_code;
            gamelog.date = date;
            gamelog.start_time = start_date;
            gamelog.restart_time = re_start_date;
            gamelog.game_id = req.body.game_id;
            gamelog.duration = 0;
            gamelog.payment = req.body.payment;
            gamelog.is_restart = req.body.is_restart;
            await gamelog.save();
        } else {
            console.log("else")
            //find last object according to unique qr_code
            let gamelog = await GameLog.find({ qr_code: qr_code }).sort({_id:-1}).limit(1);;
            
            // gamelog.qr_code = req.body.qr_code;
            gamelog = gamelog[0];
            console.log(gamelog)
            gamelog.date = date;
            // gamelog.start_time = req.body.start_time;
            // gamelog.restart_time = req.body.restart_time;
            // gamelog.game_id = req.body.game_id;
            // gamelog.duration = parseInt(req.body.start_time)-parseInt(gamelog.start_time);
            const oldtime = Date.parse(gamelog.start_time)/1000;
            
            const newtime = Date.parse(start_date)/1000;
            console.log(oldtime, newtime)
            gamelog.duration = newtime-oldtime;
            // gamelog.payment = req.body.payment;

            await gamelog.save();
        }
       
        res.status(200).send("success");

    } catch(err) {
        console.log(err);
        res.status(403).send(err);
    }
}

module.exports = {
    update,
    check,
    gamelog
}