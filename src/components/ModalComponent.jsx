import React from 'react'
import { Button, Modal } from 'react-bootstrap'

export default class ModalComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = { showModal: true };
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	render() {
		let closeButton = null;
		if (this.props.showCloseBtn === true) {
			closeButton = <Button onClick={this.closeModal}>Sulje</Button>
		}

		return (
			<div>
				<Modal show={this.state.showModal}>
						<Modal.Header>
							<Modal.Title>{this.props.title}</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>{this.props.info}</p>
							<div className="progress"><div className={this.props.barClass} style={{ width: "100%" }}></div></div>
							{this.props.loadingImg}
						</Modal.Body>
						<Modal.Footer>
							{closeButton}
						</Modal.Footer>
				</Modal>
			</div>
		);
	}

	closeModal() {
		this.setState({ showModal: false });
		this.props.onCloseModal();
	}

	openModal() {
		this.setState({ showModal: true });
	}

}