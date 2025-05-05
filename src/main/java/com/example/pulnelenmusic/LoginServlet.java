package com.example.pulnelenmusic;

import java.io.*;
import java.nio.file.Files;
import java.util.*;
import java.util.stream.Collectors;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet(name = "LoginServlet", value = "/login")
public class LoginServlet extends HttpServlet {
    private static final String LOGIN_FILE = "C:\\login.txt";
    private LoginManager loginManager = new LoginManager(LOGIN_FILE);

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.getRequestDispatcher("login.html").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        try {
            boolean firstLogin = loginManager.isFirstLogin();
            boolean valid;
            if (firstLogin) {
                valid = "4ITIA123".equals(password);
            } else {
                valid = loginManager.validateLogin(username, password);
            }

            if (valid) {
                loginManager.registerFirstUser(username);
                HttpSession session = request.getSession();
                session.setAttribute("user", username);
                response.sendRedirect(request.getContextPath() + "/index.html");
            } else {
                response.getWriter().println("<h2>Credenziali non valide!</h2>");
                request.getRequestDispatcher("login.html").include(request, response);
            }
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}
