/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, StyleSheet, Button} from 'react-native';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-community/google-signin';
const usersCollection = firestore().collection('users');

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [isSigninInProgress, setIsSigninInProgress] = useState(false);
  const handleSignUp = () => {
    auth().createUserWithEmailAndPassword(email, password);
  };

  const handleSignIn = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        setUserId(result.user.uid);
      });
  };

  const _signIn = async () => {
    try {
      console.log('lol12345', GoogleSignin);
      await GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        webClientId:
          '1046665130439-ceab17cgdpnlirdke64s68h6ahm5bgpv.apps.googleusercontent.com',
        offlineAccess: true,
      });
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      // const user = await GoogleSignin.currentUserAsync();
      GoogleSignin.signIn()
        .then((result) => {
          console.log('1234', result);
        })
        .catch((err) => {
          console.log('2345', err);
        });
    } catch (error) {
      throw error;
    }
  };

  const saveTokenToDatabase = async (token) => {
    // Assume user is already signed in
    try {
      if (userId) {
        const user = await usersCollection.doc(`${userId}`).get();
        if (!user._exists) {
          await usersCollection.doc(`${userId}`).set({
            tokens: firestore.FieldValue.arrayUnion(token),
          });
        } else {
          await usersCollection.doc(`${userId}`).update({
            tokens: firestore.FieldValue.arrayUnion(token),
          });
        }
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('112233', remoteMessage.data);
    });
    let id = DeviceInfo.getDeviceId();
    console.log('111111111111', id);
    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log('22333', userId);
    messaging()
      .getToken()
      .then((token) => {
        return saveTokenToDatabase(token);
      });

    // Listen to whether the token changes
    return messaging().onTokenRefresh((token) => {
      saveTokenToDatabase(token);
    });
  }, [userId]);
  return (
    <View>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        style={styles.textInput}
        onChangeText={(email) => setEmail(email)}
        value={email}></TextInput>
      <TextInput
        secureTextEntry
        placeholder="Password"
        autoCapitalize="none"
        style={styles.textInput}
        onChangeText={(password) => setPassword(password)}
        value={password}
      />

      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Sign In" onPress={handleSignIn} />
      <GoogleSigninButton
        style={{width: 192, height: 48}}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={_signIn}
        disabled={isSigninInProgress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8,
  },
});

export default App;
