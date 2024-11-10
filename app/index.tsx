import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Button,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Alert,
  TouchableOpacity, 
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  //função de cadastro
  const signUp = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      alert('Check your email for verification!');
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  //função de login
  const signIn = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Sign in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a recuperação de senha
  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      alert('A password reset link has been sent to your email.');
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoiding}>
            
            <Image
              source={require('../assets/images/icon.png')} 
              style={styles.logo}
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Password"
            />
            {loading ? (
              <ActivityIndicator size="small" style={styles.spinner} />
            ) : (
              <>
                <View style={styles.buttonSpacing} />
                <Button onPress={signIn} title="Login" />
                <View style={styles.buttonSpacing} />
                <Button onPress={signUp} title="Create Account" />
                <View style={styles.buttonSpacing} />
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            )}
          </KeyboardAvoidingView>
        ) : (
          <View style={styles.keyboardAvoiding}>
            <Image
              source={require('../assets/images/icon.png')} 
              style={styles.logo}
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Password"
            />
            {loading ? (
              <ActivityIndicator size="small" style={styles.spinner} />
            ) : (
              <>
              
                
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
                </TouchableOpacity>
                <View style={styles.buttonSpacing} />
                <View style={styles.buttonSpacing} />
                <Button onPress={signIn} title="Login" />
                <View style={styles.buttonSpacing} />
                <Button onPress={signUp} title="Criar Conta" />
                
                
              </>
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    marginVertical: 8,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  spinner: {
    margin: 28,
  },
  buttonSpacing: {
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 40,
    marginTop: 50,
  },
  forgotPassword: {
    color: '#007bff', 
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline', 
  },
});
