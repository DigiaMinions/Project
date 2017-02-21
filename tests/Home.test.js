import React from 'react'
import ReactTestUtils from 'react-addons-test-utils' 
import Home from '../src/components/Home.jsx'

const HomeComponent = ReactTestUtils.renderIntoDocument(<Home />);

test('click feed button', () => {
	const btnFeed = HomeComponent.refs.btnFeed;
	ReactTestUtils.Simulate.click(btnFeed);
	expect(HomeComponent.state.feedState).toBe('asdsad');
});
