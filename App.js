/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Image,
  FlatList,
  Pressable,
  Modal,
} from 'react-native';
import {WebView} from 'react-native-webview';
import SwitchSelector from 'react-native-switch-selector';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>('');
  const [questionsResponseArray, setQuestionsResponseArray] = useState<Array>(
    [],
  );
  const [requestStatus, setRequestStatus] = useState<string>('');
  const [questionLink, setQuestionLink] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const backgroundStyleColor = isDarkMode ? 'black' : 'white';
  const textStyleColor = isDarkMode ? 'white' : 'black';

  const sortOptions = [
    {label: 'Creation Date', value: '0'},
    {label: 'Answers Count', value: '1'},
    {label: 'View Count', value: '2'},
  ];

  const getStackOverflowQuestions = async () => {
    setRequestStatus('');
    try {
      const response = await fetch(
        `https://api.stackexchange.com/2.2/users/${userID}/questions?order=desc&sort=creation&site=stackoverflow`,
      );
      const responseJson = await response.json();
      if (responseJson.error_id) {
        throw 'Something went wrong';
      } else if (responseJson.items.length === 0) {
        throw 'no such user';
      }
      setQuestionsResponseArray(responseJson.items);

      setRequestStatus('success');
    } catch (error) {
      console.error('error', error);
      setRequestStatus('fail');
    }
  };

  const renderItem = ({item}) => (
    <Pressable
      onPress={() => openQuestion(item.link)}
      style={[
        styles.card,
        {
          borderColor: textStyleColor,
          backgroundColor: backgroundStyleColor,
          shadowColor: textStyleColor,
        },
      ]}>
      <Text style={{width: '75%', color: textStyleColor}}>{item.title}</Text>
      <Text style={{color: textStyleColor, fontSize: 20}}>{'>'}</Text>
    </Pressable>
  );

  const openQuestion = link => {
    setQuestionLink(link);
    setModalVisible(true);
  };

  const sortQuestionsBy = value => {
    let newSort;
    switch (value) {
      case '0':
        newSort = [...questionsResponseArray].sort((a, b) => {
          return a.creation_date < b.creation_date;
        });
        break;
      case '1':
        newSort = [...questionsResponseArray].sort((a, b) => {
          return a.answer_count < b.answer_count;
        });
        break;
      case '2':
        newSort = [...questionsResponseArray].sort((a, b) => {
          return a.view_count < b.view_count;
        });
    }
    setQuestionsResponseArray(newSort);
  };

  return (
    <View style={[styles.background, {backgroundColor: backgroundStyleColor}]}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <WebView
          source={{
            uri: questionLink,
          }}
        />
      </Modal>
      <View style={styles.darkModeButtonCotainer}>
        <Button
          title={isDarkMode ? 'Let There Be Light' : 'Let There Be Darkness'}
          onPress={() => setIsDarkMode(!isDarkMode)}
        />
      </View>
      <Text style={[styles.title, {color: textStyleColor}]}>
        Get Stack Overflow Posts
      </Text>
      <TextInput
        style={[
          styles.textInput,
          {borderColor: textStyleColor, color: textStyleColor},
        ]}
        placeholder={'Enter Stack Overflow User ID'}
        placeholderTextColor={isDarkMode ? textStyleColor : 'lightgray'}
        value={userID}
        onChangeText={setUserID}
        blurOnSubmit={true}
        onSubmitEditing={getStackOverflowQuestions}
      />
      {requestStatus === 'fail' && (
        <Text style={{color: 'red'}}>Something went wrong</Text>
      )}
      {requestStatus === 'success' && questionsResponseArray[0]?.owner && (
        <>
          <View style={styles.midContainer}>
            <Image
              source={{
                uri: questionsResponseArray[0].owner.profile_image,
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={{color: textStyleColor}}>
                Display Name: {questionsResponseArray[0].owner.display_name}
              </Text>
              <Text style={{color: textStyleColor}}>
                Reputation: {questionsResponseArray[0].owner.reputation}
              </Text>
            </View>
          </View>
          <View styles={styles.midContainer}>
            <Text
              style={[
                styles.selectorTitle,
                {
                  color: textStyleColor,
                },
              ]}>
              Questions Sort By
            </Text>
            <SwitchSelector
              style={{width: '70%'}}
              options={sortOptions}
              initial={0}
              onPress={value => sortQuestionsBy(value)}
              buttonColor={'blue'}
              backgroundColor={backgroundStyleColor}
              textStyle={{color: textStyleColor}}
              hasPadding
            />
          </View>
          <FlatList
            style={{marginTop: '5%'}}
            data={questionsResponseArray}
            renderItem={renderItem}
            keyExtractor={item => item.question_id}
            ListFooterComponent={() => <View style={{height: 35}} />}
          />
          <Text
            style={{
              marginVertical: '5%',
              color: textStyleColor,
            }}>
            Total of {questionsResponseArray.length} questions found
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
  },
  darkModeButtonCotainer: {
    marginTop: '5%',
  },
  title: {
    textAlign: 'center',
    marginTop: '5%',
    fontSize: 20,
  },
  textInput: {
    width: '75%',
    marginTop: '5%',
    padding: '5%',
    borderWidth: 1,
    borderRadius: 10,
  },
  midContainer: {
    flexDirection: 'row',
    width: '60%',
    marginTop: '5%',
    justifyContent: 'space-between',
  },
  avatar: {
    height: 50,
    width: undefined,
    aspectRatio: 1,
  },
  selectorTitle: {
    textAlign: 'center',
    marginTop: '6%',
    fontWeight: 'bold',
    marginBottom: '2%',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '3%',
    borderWidth: 1,
    borderRadius: 10,
    padding: '4%',
    alignItems: 'center',
    elevation: 5,
  },
});

export default App;
