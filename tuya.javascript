import React, { useEffect, useState } from 'react';
import { View, Text, Button, PermissionsAndroid } from 'react-native';
import { BluetoothManager, TuyaCoreApi } from 'tuyasmart-home-sdk';

const SmartPlugControlScreen = () => {
  const [isConnected, setConnected] = useState(false);
  const [insideTemperature, setInsideTemperature] = useState(null);

  useEffect(() => {
    // Request location permission
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

    // Initialize TUYA SDK
    TuyaCoreApi.initWithOptions({
      appKey: 'YOUR_APP_KEY',
      secret: 'YOUR_SECRET',
      country: 'YOUR_COUNTRY',
    });

    // Start scanning for Bluetooth devices
    BluetoothManager.init();
    BluetoothManager.startScan();

    // Subscribe to temperature updates
    TuyaCoreApi.addListener('onDevicePropertyChanged', handleDevicePropertyChanged);

    return () => {
      // Clean up listeners
      TuyaCoreApi.removeListener('onDevicePropertyChanged', handleDevicePropertyChanged);
    };
  }, []);

  const handleDevicePropertyChanged = (data) => {
    if (data.property === 'temperature') {
      setInsideTemperature(data.value);
    }
  };

  const connectViaBluetooth = async () => {
    try {
      // Stop scanning for Bluetooth devices
      BluetoothManager.stopScan();

      // Connect to the smart plug via Bluetooth
      await TuyaCoreApi.connectBLEDevice('YOUR_DEVICE_ID');

      // Set the connected state
      setConnected(true);
    } catch (error) {
      console.log('Error connecting via Bluetooth:', error);
    }
  };

  const turnOn = () => {
    TuyaCoreApi.publishDps({
      devId: 'YOUR_DEVICE_ID',
      dps: {
        '1': true, // Assuming '1' is the on/off property of your smart plug
      },
    });
  };

  const turnOff = () => {
    TuyaCoreApi.publishDps({
      devId: 'YOUR_DEVICE_ID',
      dps: {
        '1': false, // Assuming '1' is the on/off property of your smart plug
      },
    });
  };

  return (
    <View>
      <Text>Inside Temperature: {insideTemperature}</Text>
      {!isConnected ? (
        <Button title="Connect via Bluetooth" onPress={connectViaBluetooth} />
      ) : (
        <View>
          <Button title="Turn On" onPress={turnOn} />
          <Button title="Turn Off" onPress={turnOff} />
        </View>
      )}
    </View>
  );
};

export default SmartPlugControlScreen;
