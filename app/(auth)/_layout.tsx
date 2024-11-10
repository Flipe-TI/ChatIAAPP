import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import auth from '@react-native-firebase/auth';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [fileData, setFileData] = useState(null);
  const user = auth().currentUser;


  // Pegar a parte antes do @ do cliente
  const getEmailPrefix = (email) => {
    if (email) {
      return email.split('@')[0]; 
    }
    return '';
  };

  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', 
        copyToCacheDirectory: true,
      });

      if (result.canceled === false) {
        const uri = `${FileSystem.cacheDirectory}${result.assets[0].name}`; 

        // Copiando o arquivo para o cache
        await FileSystem.copyAsync({
          from: result.assets[0].uri,
          to: uri,
        });

        alert(`Arquivo selecionado com Sucesso, faça uma pergunta sobre os dados!`);

        let jsonData;

        // Caso precise ler o arquivo em formato Base64
        if (result.assets[0].name.endsWith('.csv')) {
          const fileContent = await FileSystem.readAsStringAsync(uri);
          jsonData = Papa.parse(fileContent, {
            header: true, // Usa a primeira linha como cabeçalho
            skipEmptyLines: true,
          }).data;

          // Processamento para Excel (.xlsx)
        } else if (result.assets[0].name.endsWith('.xlsx')) {
          const fileContent = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const workbook = XLSX.read(fileContent, { type: 'base64' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
        }

        console.log('Arquivo selecionado com Sucesso, faça uma pergunta sobre os dados!');
        setFileData(jsonData); 
      }
    } catch (error) {
      console.error(
        'Erro ao processar o arquivo contactar adminastor e informar o seguinte erro:',
        error
      );
    }
  };

  const handleSend = async () => {
    if (newMessage.trim() && fileData) {
      try {
        const userMessage = {
          id: messages.length + 1,
          text: newMessage,
          createdAt: new Date(),
          sender: 'user', 
        };

        setMessages([userMessage, ...messages]); 

        
        setNewMessage('');

        
        const response = await fetch('http://35.247.253.161:8000/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: fileData,
            question: newMessage, 
          }),
        });

        const responseData = await response.json();
        console.log(responseData);

        
        const responseMessage = {
          id: messages.length + 2, 
          text: responseData.response || 'Erro na resposta da API',
          createdAt: new Date(),
          sender: 'bot', 
        };

        setMessages((prevMessages) => [responseMessage, ...prevMessages]); 
      } catch (error) {
        console.error('Erro ao enviar a requisição:', error);
        alert('Erro ao processar sua solicitação');
      }
    } else {
      alert('Por favor, insira uma mensagem e anexe um arquivo antes de enviar.');
    }
  };

  const handleSignOut = () => {
    auth().signOut().then(() => {
      navigation.replace('Login'); // Redireciona para a tela de login após o logout
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Olá, {getEmailPrefix(user?.email)}</Text>
        <View style={styles.headerButtons}>
          
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleFilePicker}
          >
            <Text style={styles.attachButtonText}>Anexar Dados</Text>
          </TouchableOpacity>
          
          <Button title="Sign out" onPress={handleSignOut} />
        </View>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text>{item.text}</Text>
          </View>
        )}
        inverted
      />
      <TextInput
        style={styles.input}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Digite sua pergunta"
      />
      <Button title="Enviar" onPress={handleSend} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  header: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachButton: {
    backgroundColor: '#28a745', 
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  attachButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 16,
  },
  message: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  userMessage: {
    backgroundColor: '#cfe2f3', 
  },
  botMessage: {
    backgroundColor: '#f4f4f4', 
  },
});

export default ChatScreen;
