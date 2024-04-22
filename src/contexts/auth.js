import { createContext, useEffect,useState } from "react";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) =>{
    const [user,setUser] = useState();
    useEffect(() => {
        const userToken = localStorage.getItem("user_token")
        const userStorage = localStorage.getItem("user_db")

        if(userToken && userStorage){
            const hasUser = JSON.parse(userStorage)?.filter(
                (user) => user.matricula === JSON.parse(userToken).matricula
            );
            if (hasUser) setUser(hasUser[0]);
        }
    },[]);

    const signin = (matricula,senha) => {
        const userStorage = JSON.parse(localStorage.getItem("users_db"))
        const hasUser = userStorage?.filter((user) => user.matricula === matricula)
        if (hasUser?.length) {
            if(hasUser[0].matricula === matricula && hasUser[0].password === senha) {
                const token = Math.random().toString(36).substring(2);
                localStorage.setItem("user_token", JSON.stringify({matricula,token}));
                setUser({matricula,senha});
                return;
            } else{
                return "Matricula ou senha incorretos";
            }
        }else{
            return "Usuário não encontrado";
        }
    };

    const signup = (matricula,senha) => {
        const userStorage = JSON.parse(localStorage.getItem("users_db"))
        const hasUser = userStorage?.filter((user) => user.matricula === matricula);
        
        if(hasUser?.length){
            return "Conta existente com essa matricula"
        }

        let newUser;

        if(userStorage){
            newUser = [...userStorage,{matricula,senha}];
        }else{
            newUser = [{matricula,senha}];
        }


        localStorage.setItem("user_db",JSON.stringify(newUser));

        return;
    };

    const signout = () => {
        setUser(null);
        localStorage.removeItem("user_token");
    };


    return (
        <AuthContext.Provider value={{user,signed: !!user,signin,signup,signout}}>
            {children}
        </AuthContext.Provider>)
};