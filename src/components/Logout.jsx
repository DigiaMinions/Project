import { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

class LogoutPage extends Component {

  componentWillMount() {
    this.props.dispatch(authActionCreators.logout())
    this.props.router.replace('/auth')
  }

  render() {
    return null
  }
}
LogoutPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired
}

export default connect()(withRouter(LogoutPage))