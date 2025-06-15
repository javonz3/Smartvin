import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, CreditCard as Edit3, Mail, Phone, MapPin, Building, ChevronRight, Moon, Sun, Monitor } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  dealerLicense: string;
}

const mockProfile: UserProfile = {
  name: 'John Smith',
  email: 'john.smith@dealership.com',
  phone: '(555) 123-4567',
  company: 'Smith Auto Sales',
  location: 'Dallas, TX',
  dealerLicense: 'TX-12345',
};

export default function Profile() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const [profile, setProfile] = useState(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);
    
    // Format based on length
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setProfile({ ...profile, phone: formatted });
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Sun size={20} color={theme.colors.primary} />;
      case 'dark':
        return <Moon size={20} color={theme.colors.primary} />;
      case 'system':
        return <Monitor size={20} color={theme.colors.primary} />;
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
    }
  };

  const handleThemeToggle = () => {
    const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  const menuItems = [
    {
      icon: <Bell size={20} color={theme.colors.primary} />,
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      hasSwitch: true,
      switchValue: notifications,
      onSwitchChange: setNotifications,
    },
    {
      icon: <Shield size={20} color={theme.colors.primary} />,
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      onPress: () => {},
    },
    {
      icon: <Settings size={20} color={theme.colors.primary} />,
      title: 'App Settings',
      subtitle: 'Customize your app experience',
      onPress: () => {},
    },
    {
      icon: <HelpCircle size={20} color={theme.colors.primary} />,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => {},
    },
  ];

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={32} color="#ffffff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <Text style={styles.profileCompany}>{profile.company}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <User size={20} color={theme.colors.textTertiary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Full Name</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profile.name}
                  onChangeText={(text) => setProfile({ ...profile, name: text })}
                  placeholderTextColor={theme.colors.textTertiary}
                />
              ) : (
                <Text style={styles.inputValue}>{profile.name}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Mail size={20} color={theme.colors.textTertiary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profile.email}
                  onChangeText={(text) => setProfile({ ...profile, email: text })}
                  keyboardType="email-address"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              ) : (
                <Text style={styles.inputValue}>{profile.email}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Phone size={20} color={theme.colors.textTertiary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profile.phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  placeholderTextColor={theme.colors.textTertiary}
                  placeholder="(555) 123-4567"
                  maxLength={14} // (XXX) XXX-XXXX = 14 characters
                />
              ) : (
                <Text style={styles.inputValue}>{profile.phone}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Building size={20} color={theme.colors.textTertiary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Company</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profile.company}
                  onChangeText={(text) => setProfile({ ...profile, company: text })}
                  placeholderTextColor={theme.colors.textTertiary}
                />
              ) : (
                <Text style={styles.inputValue}>{profile.company}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={theme.colors.textTertiary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Location</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profile.location}
                  onChangeText={(text) => setProfile({ ...profile, location: text })}
                  placeholderTextColor={theme.colors.textTertiary}
                />
              ) : (
                <Text style={styles.inputValue}>{profile.location}</Text>
              )}
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {/* Theme Toggle */}
          <TouchableOpacity style={styles.menuItem} onPress={handleThemeToggle}>
            <View style={styles.menuIcon}>
              {getThemeIcon()}
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Theme</Text>
              <Text style={styles.menuSubtitle}>Current: {getThemeLabel()}</Text>
            </View>
            <View style={styles.themeToggleButton}>
              <Text style={styles.themeToggleText}>{getThemeLabel()}</Text>
            </View>
          </TouchableOpacity>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                {item.icon}
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              {item.hasSwitch ? (
                <Switch
                  value={item.switchValue}
                  onValueChange={item.onSwitchChange}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#ffffff"
                />
              ) : (
                <ChevronRight size={20} color={theme.colors.textTertiary} />
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Settings size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Auto-save Reports</Text>
              <Text style={styles.menuSubtitle}>Automatically save valuation reports</Text>
            </View>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={theme.colors.error} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>SmartVIN v1.0.0</Text>
          <Text style={styles.footerText}>© 2024 SmartVIN. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e0e7ff',
    marginTop: 2,
  },
  profileCompany: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#e0e7ff',
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    gap: 16,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    gap: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  menuSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  themeToggleButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
    backgroundColor: theme.colors.error + '10',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});