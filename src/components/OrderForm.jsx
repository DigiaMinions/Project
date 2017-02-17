import React from 'react'

export default class OrderForm extends React.Component {

 constructor(props){
        super(props);
        this.state = { name: '', mac: '' };
        this.onNameChange = this.onNameChange.bind(this)
        this.onMacChange = this.onMacChange.bind(this)
        this.addDevice = this.addDevice.bind(this)
    }

  

                  addDevice()
    {
        console.log('Adding device!');
        var form = new FormData();
        form.append('name', this.state.name);
        form.append('mac', this.state.mac);
        var that = this;
        fetch('/tilaus', {
                credentials: 'same-origin',
                method: 'POST',
                body: form
            })
            .then(function(res) {
                console.log("Successia puskee: ", res);       
                window.location.href = '/';      
                //that.setState({ showMessage: true, message: 'Tallentaminen onnistui!'});              
            })
            .catch(function(err) {
                //that.setState({ showMessage: true, message: 'Tapahtui virhe. :('})
                console.log("Erroria puskee: ", err);
            });
    }

    onNameChange(event)
    {
      this.setState({name: event.target.value})
    }

    onMacChange(event)
    {
      this.setState({mac: event.target.value})
    }

    render(){
        return(
             <div className="well">
                    <div className="form-horizontal">
                        <fieldset>

                            <legend>Lisää laite</legend>

                            <div className="form-group">
                                <label className="col-md-4 control-label">Valitse laitteen tyyppi</label>
                                <div className="col-md-4">
                                    <select className="selectDeviceType" name="deviceType" className="form-control">
                                        <option defaultValue value="1">Syöttölaite</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="col-md-4 control-label">Nimeä laite</label>  
                                <div className="col-md-4">
                                    <input name="name" onChange={this.onNameChange} type="text" className="form-control input-md" required="Syötä nimi" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="col-md-4 control-label">MAC</label>  
                                <div className="col-md-4">
                                    <input name="mac" type="text" onChange={this.onMacChange} className="form-control input-md" required="Syötä MAC" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="col-md-4 control-label"></label>
                                <div className="col-md-4">
                                    <button className="button button-block" onClick={() => this.addDevice()}>Tallenna</button>
                                </div>
                            </div>

                        </fieldset>
                    </div>
                </div>
                )
    }
}