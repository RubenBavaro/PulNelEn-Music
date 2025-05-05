package com.example.pulnelenmusic;

import java.io.*;

public class LoginManager {
    private final String filePath;

    public LoginManager(String filePath) {
        this.filePath = filePath;
    }

    public boolean isFirstLogin() throws IOException {
        File f = new File(filePath);
        return !f.exists() || f.length() == 0;
    }

    public void registerFirstUser(String username) throws IOException {
        try (FileWriter w = new FileWriter(filePath, false)) {
            // write only username
            w.write(username);
        }
    }

    public boolean validateLogin(String user, String pass) throws IOException {
        try (BufferedReader r = new BufferedReader(new FileReader(filePath))) {
            String storedUser = r.readLine();
            if (storedUser == null) return false;
            // password always fixed
            return storedUser.trim().equals(user) && "4ITIA123".equals(pass);
        }
    }
}