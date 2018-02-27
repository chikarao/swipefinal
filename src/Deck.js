import React, { Component } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.30 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  }
  //when using reusable components, use default props
  // so that when some functions are not called, there is a default value  and no error
  constructor(props) {
  // consturctor and super are usual set-ups
    super(props);
  // panResponder will be self contained obj;
  // no need to involve state system; can do this.panResponder
  // but we will do this.state.panResponder to stick with documentation
    const position = new Animated.ValueXY();

    const panResponder = PanResponder.create({
// functions to be called in different points in lifecycle
// there are others so check docs
      onStartShouldSetPanResponder: () => true,
    // executed anytime user taps on screen
    // if return true, this panResponder is resposible
    // can run code to determine if we want to run
      onPanResponderMove: (event, gesture) => {
    // true callback; called when finger dragged
    // event is obj descibes what user pressing down on
    //gesture argument has info on what user is doing, how quickly etc
    //to save memory gesture is zeroed out after moving out of onPanResponderMove
      position.setValue({ x: gesture.dx, y: gesture.dy });
      //changing state directly which is not good, but following documentation
      // console.log(gesture);
    },
    onPanResponderRelease: (event, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        // console.log('swipe right!!')
        this.forceSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        // console.log('swipe left!!')
        this.forceSwipe('left');
      } else {
        this.resetPosition();
      }
    }
    // when user lets finger go; can replace the componenent
    });
    this.state = { panResponder, position, index: 0 };
    }
    //end of constructor

    componentWillReceiveProps(nextProps) {
      if (nextProps !== this.props.data) {
        // asks whether its the exact same obj in memeory, not what's inside
        this.setState( { index: 0 });
      }
    }
    // resets index when component receives new set of data

    componentWillUpdate() {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
      LayoutAnimation.spring();
      // when rerenders this Deck component needs to animate any changes
      // change is the positioning, implements spring
      // if this function exists, call it with true
    }

    getCardStyle() {
      const { position } = this.state;
      const rotate = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
        outputRange: ['-120deg', '0deg', '120deg']
      });
    // negative proportional association
      return {
        ...position.getLayout(),
        transform:[{ rotate }]
      };
    }

    forceSwipe(direction) {
      const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

      Animated.timing(this.state.position, {
        toValue: { x, y: 0 },
        duration: SWIPE_OUT_DURATION
      }).start(() => this.onSwipeComplete(direction));
    }

    onSwipeComplete(direction) {
      const { onSwipeLeft, onSwipeRight, data } = this.props;
      const item = data[this.state.index];

      direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
      this.setState({ index: this.state.index + 1});
    // not doing this.state.index, resetting value not modifying existing value
    // increment index to show next card
      this.state.position.setValue({ x: 0, y: 0 });
      // reset the initial position of next card
      // misuse of state but following docs, can just do this.position
    }

    resetPosition() {
      Animated.spring(this.state.position, {
        toValue: { x: 0, y: 0 }
      }).start();
    }

    renderCards() {

      if (this.state.index >= this.props.data.length) {
        return this.props.renderNoMoreCards();
      }

      return this.props.data.map((item, i) => {
        if (i < this.state.index) { return null; }

        if (i === this.state.index) {
          return (
            <Animated.View
              key={item.id}
              style={[this.getCardStyle(), styles.cardStyle]}
              {...this.state.panResponder.panHandlers}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          );
        }
        return  (
          <Animated.View
            key={item.id}
            style={[styles.cardStyle, { top: 10 * (i - this.state.index) }] }
          >
          {this.props.renderCard(item)}
          </Animated.View>
          // view to animatedview causes rerender
        );
      }).reverse();
      // reverse order of map array
    }
// panHandlers is an obj that has callbacks that intercepts presses from user
// ... spreading properties over View
// taking all callbacks and passing them to the View; ties panResponder to view
    render() {
      return(
        <View>
          {this.renderCards()}
        </View>
      );
    }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
    // left: 0,
    // right: 0
    // left and right do not work well with rn
  }
};

export default Deck;
