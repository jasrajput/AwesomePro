import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// import { requestUserPermission } from './src/components/helpers';

// import { initializeFirebase } from './src/components/firebaseHelpers';

// requestUserPermission();
// initializeFirebase();
// handleForegroundMessages();
// handleOnOpenNotification();

// AppRegistry.registerHeadlessTask('RNFirebaseForegroundMessage', handleForegroundMessages);
// AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', initializeFirebase);
// AppRegistry.registerHeadlessTask('RNFirebaseBackgroundNotificationAction', handleOnOpenNotification);
AppRegistry.registerComponent(appName, () => App);