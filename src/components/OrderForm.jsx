import React from 'react'

export default class OrderForm extends React.Component {

    constructor(props){
        super(props);
        this.state = { message: false, messageStatement: '' };
    }

    addDevice()
    {
        console.log('Adding device!');
        var form = document.querySelector('form');
        fetch('/tilaus', {
                credentials: 'same-origin',
                method: 'POST',
                body: new FormData(form)
            })
            .then(function(res) {
                return response.json();                
            })
            .then(function(res) {
                console.log("Successia puskee: ", res);
                this.setState({ message: true, messageStatement: 'Tallentaminen onnistui!'});              
            }).bind(this)
            .catch(function(err) {
                 this.setState({ message: true, messageStatement: 'Tapahtui virhe. :('})
                console.log("Erroria puskee: ", err);
            }).bind(this);
    }

    render()
    {
        return(
                <div className="well">
                    <form action='/tilaus' method='post' className="form-horizontal">
                        <fieldset>
                            <legend>Lisää laite</legend>

                            <div className="form-group">
                              <label className="col-md-4 control-label" for="selectbasic">Valitse laitteen tyyppi</label>
                              <div className="col-md-4">
                                <select className="selectDeviceType" name="deviceType" className="form-control">
                                  <option selected value="1">Syöttölaite</option>
                                </select>
                              </div>
                            </div>

                            <div className="form-group">
                              <label className="col-md-4 control-label" for="textinput">Nimeä laite</label>  
                              <div className="col-md-4">
                                  <input name="name" type="text" className="form-control input-md" required="Syötä nimi" />
                              </div>
                            </div>

                            <div className="form-group">
                              <label className="col-md-4 control-label" for="textinput">MAC</label>  
                              <div className="col-md-4">
                                  <input name="mac" type="text" className="form-control input-md" required="Syötä MAC" />
                              </div>
                            </div>

                            <div className="form-group">
                              <label className="col-md-4 control-label" for="singlebutton"></label>
                              <div className="col-md-4">
                                <button className="button button-block">Tallenna</button>
                              </div>
                            </div>
                        </fieldset>
                    </form>
                </div>

                
                
        );
    }
}