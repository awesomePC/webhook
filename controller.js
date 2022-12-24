const PayStatus = require("./model");

const update = async (req, res) => {

    try{
        //receive data from webhook whenever users pay.
        let data = req.body.payload.payment.entity;
        
        //extract neccessary data from webhook and save those according to qr_code
        const newPayStatus = new PayStatus();
        newPayStatus.qr_code = req.body.payload.qr_code.entity.id;
        newPayStatus.status = data.captured;
        newPayStatus.timestamp =  data.created_at;
        
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
    
    //get updated paymend data according to qr_code and send state
    data = await PayStatus.find({ qr_code: qr_code });
    // filter({ qr_code: qr_code });
    res.status(200).send(data);
}

module.exports = {
    update,
    check
}