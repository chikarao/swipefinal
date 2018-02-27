import React, { Component } from 'react';
import { View, Animated } from 'react-native';

//Animated.ValueXY returns where the obj is
class Ball extends Component {
  componentWillMount() {
    this.position = new Animated.ValueXY(0, 0);
    // 0,0 is starting value
    Animated.spring(this.position, {
      // spring updates position to 200 to 500
      // tovalue changes value over time, default of 1 sec
      toValue: { x: 200, y: 500 }
    }).start();
  }
// can nest as many components as want in animated.view
  render() {
    return (
      <Animated.View style={this.position.getLayout()}>
      <View style={styles.ball} />
      </Animated.View>
    );
  }
}

const styles = {
  ball: {
    height: 150,
    width: 150,
    borderRadius: 75,
    borderWidth: 75,
    borderColor: 'blue'
  }
};

export default Ball;
