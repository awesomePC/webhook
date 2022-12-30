const PayStatus = require("./model");

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

module.exports = {
    update,
    check
}